import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAchievements } from '@/hooks/use-achievements';
import { useAuth } from '@/hooks/use-auth';
import { Brain, School, Bot, BookOpenCheck, Briefcase, Medal, Dna } from 'lucide-react';

export function AchievementsDisplay() {
  const { user } = useAuth();
  const { 
    unlockedAchievements, 
    lockedAchievements, 
    currentAchievement, 
    nextAchievement,
    isLoading 
  } = useAchievements();
  
  // Get icon component based on achievement icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'school': return <School />;
      case 'smart_toy': return <Bot />;
      case 'psychology': return <BookOpenCheck />;
      case 'work': return <Briefcase />;
      case 'military_tech': return <Medal />;
      case 'self_improvement': return <Dna />;
      default: return <Brain />;
    }
  };
  
  // Calculate progress to next level
  const calculateProgress = () => {
    if (!user || !currentAchievement || !nextAchievement) return 0;
    
    const currentTime = user.totalStudyTime;
    const nextLevelTime = nextAchievement.requiredTime;
    const currentLevelTime = currentAchievement.requiredTime;
    
    return Math.min(Math.round(
      ((currentTime - currentLevelTime) / (nextLevelTime - currentLevelTime)) * 100
    ), 100);
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Your Achievements</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Loading achievements...</p>
          </div>
        ) : (
          <>
            <div className="relative mb-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-3">
                  {currentAchievement ? (
                    <span className="text-4xl text-primary dark:text-indigo-400">
                      {getIconComponent(currentAchievement.icon)}
                    </span>
                  ) : (
                    <Brain className="text-4xl text-primary dark:text-indigo-400" />
                  )}
                </div>
                <span className="text-lg font-bold">
                  {currentAchievement ? currentAchievement.name : 'No achievements yet'}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentAchievement 
                    ? `${Math.floor(currentAchievement.requiredTime / 3600)} hours of study` 
                    : 'Start studying to unlock achievements'}
                </span>
                {nextAchievement && (
                  <>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Next level: {nextAchievement.name} ({Math.floor(nextAchievement.requiredTime / 3600)} hours)
                    </div>
                    <Progress value={calculateProgress()} className="w-full h-2 mt-2" />
                  </>
                )}
              </div>
            </div>
            
            {unlockedAchievements.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Unlocked Achievements</h3>
                <div className="grid grid-cols-3 gap-3">
                  {unlockedAchievements.map((achievement) => (
                    <div key={achievement.id} className="achievement-icon flex flex-col items-center transition-transform hover:scale-110">
                      <div 
                        className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center mb-1"
                        style={{ 
                          backgroundColor: `hsl(${achievement.level * 30}, 70%, 85%)`,
                          color: `hsl(${achievement.level * 30}, 70%, 45%)`
                        }}
                      >
                        {getIconComponent(achievement.icon)}
                      </div>
                      <span className="text-xs text-center">{achievement.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {lockedAchievements.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 my-3">Locked Achievements</h3>
                <div className="grid grid-cols-3 gap-3">
                  {lockedAchievements.map((achievement) => (
                    <div key={achievement.id} className="achievement-icon flex flex-col items-center opacity-50">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-1">
                        {getIconComponent(achievement.icon)}
                      </div>
                      <span className="text-xs text-center">{achievement.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
