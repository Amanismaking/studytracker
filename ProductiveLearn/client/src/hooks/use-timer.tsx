import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from '@tanstack/react-query';
import { StudySession } from '@shared/schema';

type TimerState = 'idle' | 'running' | 'paused' | 'break' | 'sleep';

interface TimerContextType {
  currentSession: StudySession | null;
  elapsedTime: number;
  timerState: TimerState;
  selectedSubjectId: number | null;
  startTimer: (subjectId: number, type?: string) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: () => Promise<void>;
  updateBreakTag: (tag: string) => Promise<void>;
  setSelectedSubjectId: (subjectId: number) => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

// Time constants
const BREAK_THRESHOLD = 15 * 60; // 15 minutes in seconds

export function TimerProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Use ref to track current timer state for setTimeout callbacks
  const timerStateRef = useRef<TimerState>('idle');

  // Update timerState ref when state changes
  useEffect(() => {
    timerStateRef.current = timerState;
  }, [timerState]);

  // Fetch active session
  const { data: activeSessions, refetch: refetchActiveSessions } = useQuery<StudySession[]>({
    queryKey: ['/api/sessions/active'],
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Refetch every minute
  });

  const currentSession = activeSessions && activeSessions.length > 0 ? activeSessions[0] : null;

  // Start a new session
  const startSessionMutation = useMutation({
    mutationFn: async (data: { subjectId: number, type: string }) => {
      const res = await apiRequest('POST', '/api/sessions/start', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error starting session',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // End a session
  const endSessionMutation = useMutation({
    mutationFn: async (data: { id: number, duration: number }) => {
      const res = await apiRequest('POST', `/api/sessions/${data.id}/end`, { duration: data.duration });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error ending session',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Update break tag
  const updateBreakTagMutation = useMutation({
    mutationFn: async (data: { sessionId: number, breakTag: string }) => {
      const res = await apiRequest('POST', `/api/sessions/${data.sessionId}/tag`, { breakTag: data.breakTag });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating break tag',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Initialize timer from active session
  useEffect(() => {
    if (currentSession && timerState === 'idle') {
      setSelectedSubjectId(currentSession.subjectId);
      
      // Calculate elapsed time
      const sessionStartTime = new Date(currentSession.startTime).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - sessionStartTime) / 1000);
      
      setElapsedTime(elapsed);
      setStartTime(sessionStartTime);
      
      if (currentSession.type === 'study') {
        setTimerState('running');
        startTimerInterval();
      } else if (currentSession.type === 'break') {
        setTimerState('break');
        startTimerInterval();
      } else if (currentSession.type === 'sleep') {
        setTimerState('sleep');
      }
    }
  }, [currentSession]);

  const startTimerInterval = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  }, [timerInterval]);

  const stopTimerInterval = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [timerInterval]);

  // Define functions in the correct order to avoid circular dependencies
  const startBreak = useCallback(async () => {
    try {
      if (currentSession) {
        await endSessionMutation.mutateAsync({
          id: currentSession.id,
          duration: elapsedTime
        });
      }
      
      await startSessionMutation.mutateAsync({ 
        subjectId: selectedSubjectId || 0, 
        type: 'break' 
      });
      
      setElapsedTime(0);
      setStartTime(Date.now());
      setTimerState('break');
      startTimerInterval();
      
      toast({
        title: 'Break started',
        description: 'Enjoy your break!',
      });
    } catch (error) {
      console.error('Error starting break:', error);
    }
  }, [currentSession, selectedSubjectId, elapsedTime, startSessionMutation, endSessionMutation, startTimerInterval, toast]);

  const startTimer = useCallback(async (subjectId: number, type: string = 'study') => {
    try {
      if (currentSession) {
        await endSessionMutation.mutateAsync({
          id: currentSession.id,
          duration: elapsedTime
        });
      }
      
      await startSessionMutation.mutateAsync({ subjectId, type });
      setSelectedSubjectId(subjectId);
      setElapsedTime(0);
      setStartTime(Date.now());
      setTimerState(type === 'study' ? 'running' : type === 'break' ? 'break' : 'sleep');
      startTimerInterval();
      
      toast({
        title: type === 'study' ? 'Study session started' : 
               type === 'break' ? 'Break started' : 'Sleep tracking started',
        description: type === 'study' ? 'Timer is now running' : 
                     type === 'break' ? 'Enjoy your break!' : 'Good night!',
      });
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  }, [currentSession, elapsedTime, startSessionMutation, endSessionMutation, startTimerInterval, toast]);

  const pauseTimer = useCallback(async () => {
    if (timerState === 'running' && currentSession) {
      stopTimerInterval();
      setTimerState('paused');
      
      // If pause is longer than the break threshold, automatically start a break
      setTimeout(() => {
        // Using the ref to check the current timer state at the time this timeout executes
        if (timerStateRef.current === 'paused') {
          startBreak();
        }
      }, BREAK_THRESHOLD * 1000);
      
      toast({
        title: 'Timer paused',
        description: 'Your study session has been paused',
      });
    }
  }, [timerState, currentSession, stopTimerInterval, toast, startBreak]);

  const resumeTimer = useCallback(async () => {
    if (timerState === 'paused' && currentSession) {
      startTimerInterval();
      setTimerState('running');
      
      toast({
        title: 'Timer resumed',
        description: 'Your study session has been resumed',
      });
    }
  }, [timerState, currentSession, startTimerInterval, toast]);

  const stopTimer = useCallback(async () => {
    if (currentSession) {
      stopTimerInterval();
      
      await endSessionMutation.mutateAsync({
        id: currentSession.id,
        duration: elapsedTime
      });
      
      setElapsedTime(0);
      setStartTime(null);
      setTimerState('idle');
      
      toast({
        title: 'Session ended',
        description: 'Your session has been saved',
      });
    }
  }, [currentSession, elapsedTime, endSessionMutation, stopTimerInterval, toast]);

  const endBreak = useCallback(async () => {
    if (timerState === 'break' && currentSession) {
      stopTimerInterval();
      
      await endSessionMutation.mutateAsync({
        id: currentSession.id,
        duration: elapsedTime
      });
      
      setElapsedTime(0);
      setTimerState('idle');
      
      toast({
        title: 'Break ended',
        description: 'Break time has been recorded',
      });
      
      // Automatically resume study session
      if (selectedSubjectId) {
        startTimer(selectedSubjectId);
      }
    }
  }, [timerState, currentSession, selectedSubjectId, elapsedTime, endSessionMutation, stopTimerInterval, startTimer, toast]);
  
  const updateBreakTag = useCallback(async (tag: string) => {
    if (currentSession && currentSession.type === 'break') {
      try {
        await updateBreakTagMutation.mutateAsync({
          sessionId: currentSession.id,
          breakTag: tag
        });
        
        toast({
          title: 'Break tagged',
          description: `Your break has been tagged as "${tag}"`,
        });
      } catch (error) {
        console.error('Error updating break tag:', error);
      }
    } else {
      toast({
        title: 'Cannot tag',
        description: 'You can only tag active break sessions',
        variant: 'destructive',
      });
    }
  }, [currentSession, updateBreakTagMutation, toast]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Sleep detection - detect when user closes tab or computer sleeps
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && timerState === 'running') {
        // User is leaving the page, pause the timer
        stopTimerInterval();
      } else if (document.visibilityState === 'visible' && timerState === 'running') {
        // User is returning, check for long absence (potential sleep)
        if (startTime) {
          const now = Date.now();
          const timeDiff = Math.floor((now - startTime) / 1000) - elapsedTime;
          
          // If away for more than 30 minutes, consider it sleep time
          if (timeDiff > 30 * 60) {
            if (currentSession) {
              await endSessionMutation.mutateAsync({
                id: currentSession.id,
                duration: elapsedTime
              });
              
              // Create a sleep session for the time away
              await startSessionMutation.mutateAsync({ 
                subjectId: selectedSubjectId || 0, 
                type: 'sleep' 
              });
              
              await endSessionMutation.mutateAsync({
                id: (await refetchActiveSessions()).data![0].id,
                duration: timeDiff
              });
              
              toast({
                title: 'Sleep detected',
                description: `You were away for ${Math.floor(timeDiff / 3600)}h ${Math.floor((timeDiff % 3600) / 60)}m. This has been recorded as sleep time.`,
              });
              
              // Restart the study session
              await startSessionMutation.mutateAsync({ 
                subjectId: selectedSubjectId || 0, 
                type: 'study' 
              });
              
              setElapsedTime(0);
              setStartTime(now);
              startTimerInterval();
            }
          } else if (timeDiff > 15 * 60) {
            // If away for more than 15 minutes but less than 30, consider it a break
            if (currentSession) {
              await endSessionMutation.mutateAsync({
                id: currentSession.id,
                duration: elapsedTime
              });
              
              // Create a break session for the time away
              await startSessionMutation.mutateAsync({ 
                subjectId: selectedSubjectId || 0, 
                type: 'break'
              });
              
              await endSessionMutation.mutateAsync({
                id: (await refetchActiveSessions()).data![0].id,
                duration: timeDiff
              });
              
              toast({
                title: 'Break detected',
                description: `You were away for ${Math.floor(timeDiff / 60)}m. This has been recorded as break time.`,
              });
              
              // Restart the study session
              await startSessionMutation.mutateAsync({ 
                subjectId: selectedSubjectId || 0, 
                type: 'study' 
              });
              
              setElapsedTime(0);
              setStartTime(now);
              startTimerInterval();
            }
          } else {
            // Just resume the timer normally
            startTimerInterval();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timerState, startTime, elapsedTime, currentSession, selectedSubjectId, startTimerInterval, stopTimerInterval, refetchActiveSessions, startSessionMutation, endSessionMutation, toast]);

  return (
    <TimerContext.Provider value={{
      currentSession,
      elapsedTime,
      timerState,
      selectedSubjectId,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
      startBreak,
      endBreak,
      updateBreakTag,
      setSelectedSubjectId
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}