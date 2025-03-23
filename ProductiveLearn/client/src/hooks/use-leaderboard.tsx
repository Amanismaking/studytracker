import { createContext, ReactNode, useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

type TimeFrame = 'today' | 'week' | 'month';

interface LeaderboardUser {
  id: number;
  displayName: string;
  totalStudyTime: number;
  level: string;
  isCurrentUser: boolean;
}

interface LeaderboardContextType {
  leaderboard: LeaderboardUser[];
  isLoading: boolean;
  error: Error | null;
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | null>(null);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');

  const {
    data: leaderboard = [],
    isLoading,
    error,
  } = useQuery<LeaderboardUser[], Error>({
    queryKey: ['/api/leaderboard', timeFrame],
    queryFn: async ({ queryKey }) => {
      const [, timeFrame] = queryKey;
      const res = await fetch(`/api/leaderboard?timeframe=${timeFrame}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      return res.json();
    },
    // Refresh every 10 seconds for real-time updates
    refetchInterval: 10000, 
    // Refresh when window gets focus
    refetchOnWindowFocus: true,
  });

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        isLoading,
        error,
        timeFrame,
        setTimeFrame,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
}
