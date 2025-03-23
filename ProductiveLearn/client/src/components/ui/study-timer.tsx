import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pause, PlayCircle, RotateCcw, Coffee, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTimer } from '@/hooks/use-timer';
import { useSubjects } from '@/hooks/use-subjects';

export function StudyTimer() {
  const { subjects } = useSubjects();
  const { 
    currentSession,
    elapsedTime,
    timerState,
    selectedSubjectId,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    startBreak,
    updateBreakTag,
    setSelectedSubjectId
  } = useTimer();
  
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');
  const [progress, setProgress] = useState(0);
  const [breakDialogOpen, setBreakDialogOpen] = useState(false);
  const [selectedBreakTag, setSelectedBreakTag] = useState<string>('rest');
  
  // Format the elapsed time for display
  useEffect(() => {
    const hours = Math.floor(elapsedTime / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(elapsedTime % 60).toString().padStart(2, '0');
    setTimerDisplay(`${hours}:${minutes}:${seconds}`);
    
    // Calculate progress (capped at 100%)
    // Assuming 2 hours is 100% for visual purposes
    const maxSeconds = 2 * 60 * 60;
    setProgress(Math.min((elapsedTime / maxSeconds) * 100, 100));
  }, [elapsedTime]);
  
  // Handle subject change
  const handleSubjectChange = (value: string) => {
    const subjectId = parseInt(value);
    setSelectedSubjectId(subjectId);
    
    // If timer is running, switch subjects
    if (timerState === 'running' && currentSession) {
      stopTimer().then(() => {
        startTimer(subjectId, 'study');
      });
    }
  };
  
  // Handle timer actions
  const handleStartStop = () => {
    if (!selectedSubjectId) return;
    
    if (timerState === 'idle') {
      startTimer(selectedSubjectId, 'study');
    } else if (timerState === 'running') {
      pauseTimer();
    } else if (timerState === 'paused') {
      resumeTimer();
    }
  };
  
  const handleReset = () => {
    if (timerState !== 'idle') {
      stopTimer();
    }
  };
  
  const handleBreak = () => {
    if (timerState === 'running') {
      startBreak();
    }
  };
  
  const handleTagBreak = (tag: string) => {
    setSelectedBreakTag(tag);
    updateBreakTag(tag);
    setBreakDialogOpen(false);
  };
  
  const getStartStopButton = () => {
    if (timerState === 'idle' || timerState === 'paused') {
      return (
        <Button className="flex items-center px-6 py-2 bg-green-500 hover:bg-green-600 text-white" onClick={handleStartStop}>
          <PlayCircle className="w-5 h-5 mr-1" />
          {timerState === 'idle' ? 'Start' : 'Resume'}
        </Button>
      );
    } else {
      return (
        <Button className="flex items-center px-6 py-2 bg-green-500 hover:bg-green-600 text-white" onClick={handleStartStop}>
          <Pause className="w-5 h-5 mr-1" />
          Pause
        </Button>
      );
    }
  };
  
  // Find current subject name
  const currentSubject = subjects.find(subject => subject.id === selectedSubjectId);
  const subjectName = currentSubject ? currentSubject.name : 'Select Subject';

  return (
    <>
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between">
          <CardTitle>Active Timer</CardTitle>
          <Select
            value={selectedSubjectId?.toString() || ''}
            onValueChange={handleSubjectChange}
            disabled={subjects.length === 0}
          >
            <SelectTrigger className="w-40 bg-gray-100 dark:bg-gray-700 border-0">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center">
          <div className="relative mb-6">
            <svg className="w-40 h-40">
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="12" 
                className="text-gray-200 dark:text-gray-700" 
              />
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="12" 
                strokeDasharray="439.8" 
                strokeDashoffset={439.8 - (439.8 * progress / 100)} 
                className="text-green-500 transform -rotate-90 origin-center" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-mono font-bold">{timerDisplay}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{subjectName}</span>
              {currentSession && currentSession.type === 'break' && (
                <div className="mt-2 flex flex-col items-center">
                  <span className={`px-3 py-1 text-sm rounded-full ${currentSession.breakTag ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 animate-pulse'}`}>
                    {currentSession.breakTag ? currentSession.breakTag : 'Break Mode'}
                  </span>
                  {!currentSession.breakTag && (
                    <span className="mt-1 text-xs text-gray-500">Click "Tag Break" to categorize</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button variant="outline" className="flex items-center text-red-600 dark:text-red-400" onClick={handleReset}>
              <RotateCcw className="w-5 h-5 mr-1" />
              Reset
            </Button>
            
            {getStartStopButton()}
            
            {timerState === 'break' ? (
              <Dialog open={breakDialogOpen} onOpenChange={setBreakDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center text-purple-500">
                    <Tag className="w-5 h-5 mr-1" />
                    Tag Break
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tag Your Break</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button 
                      variant={selectedBreakTag === 'rest' ? 'default' : 'outline'} 
                      className="flex items-center justify-center" 
                      onClick={() => handleTagBreak('rest')}
                    >
                      <Coffee className="w-5 h-5 mr-2" /> Rest
                    </Button>
                    <Button 
                      variant={selectedBreakTag === 'food' ? 'default' : 'outline'} 
                      className="flex items-center justify-center" 
                      onClick={() => handleTagBreak('food')}
                    >
                      <Coffee className="w-5 h-5 mr-2" /> Food
                    </Button>
                    <Button 
                      variant={selectedBreakTag === 'exercise' ? 'default' : 'outline'} 
                      className="flex items-center justify-center" 
                      onClick={() => handleTagBreak('exercise')}
                    >
                      <Coffee className="w-5 h-5 mr-2" /> Exercise
                    </Button>
                    <Button 
                      variant={selectedBreakTag === 'social' ? 'default' : 'outline'} 
                      className="flex items-center justify-center" 
                      onClick={() => handleTagBreak('social')}
                    >
                      <Coffee className="w-5 h-5 mr-2" /> Social
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button 
                variant="outline" 
                className="flex items-center text-blue-500" 
                onClick={handleBreak}
                disabled={timerState !== 'running'}
              >
                <Coffee className="w-5 h-5 mr-1" />
                Break
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
