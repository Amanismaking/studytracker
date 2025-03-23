import { createContext, ReactNode, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Achievement } from '@shared/schema';

type AchievementWithStatus = Achievement & { unlocked: boolean };

interface AchievementsContextType {
  achievements: AchievementWithStatus[];
  isLoading: boolean;
  error: Error | null;
  unlockedAchievements: AchievementWithStatus[];
  lockedAchievements: AchievementWithStatus[];
  currentAchievement: AchievementWithStatus | null;
  nextAchievement: AchievementWithStatus | null;
}

const AchievementsContext = createContext<AchievementsContextType | null>(null);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const {
    data: achievements = [],
    isLoading,
    error,
  } = useQuery<AchievementWithStatus[], Error>({
    queryKey: ['/api/achievements'],
    // Update every minute for achievements (less frequent than other hooks)
    refetchInterval: 60000,
    // Also refresh when window gets focus
    refetchOnWindowFocus: true,
  });

  // Sort achievements by level
  const sortedAchievements = [...achievements].sort((a, b) => a.level - b.level);
  
  // Filter unlocked and locked achievements
  const unlockedAchievements = sortedAchievements.filter(
    (achievement) => achievement.unlocked
  );
  
  const lockedAchievements = sortedAchievements.filter(
    (achievement) => !achievement.unlocked
  );
  
  // Get current achievement (highest unlocked)
  const currentAchievement = unlockedAchievements.length > 0
    ? unlockedAchievements[unlockedAchievements.length - 1]
    : null;
  
  // Get next achievement to unlock
  const nextAchievement = lockedAchievements.length > 0
    ? lockedAchievements[0]
    : null;

  return (
    <AchievementsContext.Provider
      value={{
        achievements: sortedAchievements,
        isLoading,
        error,
        unlockedAchievements,
        lockedAchievements,
        currentAchievement,
        nextAchievement,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
}
