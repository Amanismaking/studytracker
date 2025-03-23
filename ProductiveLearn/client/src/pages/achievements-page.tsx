import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAchievements } from "@/hooks/use-achievements";
import { useAuth } from "@/hooks/use-auth";
import { Award, Brain, School, Bot, BookOpenCheck, Briefcase, Medal, Dna } from "lucide-react";

export default function AchievementsPage() {
  const { user } = useAuth();
  const { 
    achievements,
    unlockedAchievements, 
    lockedAchievements, 
    currentAchievement, 
    nextAchievement,
    isLoading
  } = useAchievements();

  // Get icon component based on achievement icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'school': return <School className="w-8 h-8" />;
      case 'smart_toy': return <Bot className="w-8 h-8" />;
      case 'psychology': return <BookOpenCheck className="w-8 h-8" />;
      case 'work': return <Briefcase className="w-8 h-8" />;
      case 'military_tech': return <Medal className="w-8 h-8" />;
      case 'self_improvement': return <Dna className="w-8 h-8" />;
      default: return <Brain className="w-8 h-8" />;
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

  // Format time in hours
  const formatHours = (seconds: number) => {
    return `${Math.floor(seconds / 3600)} hours`;
  };

  return (
    <SidebarLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-gray-500 dark:text-gray-400">Track your progress and unlock new achievements</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading achievements...</p>
        </div>
      ) : (
        <>
          {/* Current Achievement & Progress */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Current Level</CardTitle>
              <CardDescription>Keep studying to reach the next level</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center">
              <div className="flex flex-col items-center mb-6 md:mb-0 md:mr-10">
                <div className="w-32 h-32 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-3">
                  {currentAchievement ? (
                    <span className="text-4xl text-primary dark:text-indigo-400">
                      {getIconComponent(currentAchievement.icon)}
                    </span>
                  ) : (
                    <Brain className="w-16 h-16 text-primary dark:text-indigo-400" />
                  )}
                </div>
                <h2 className="text-xl font-bold">
                  {currentAchievement ? currentAchievement.name : 'No achievements yet'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentAchievement 
                    ? `${formatHours(currentAchievement.requiredTime)} of study` 
                    : 'Start studying to unlock achievements'}
                </p>
              </div>
              
              <div className="flex-1 w-full">
                {nextAchievement ? (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{currentAchievement?.name}</span>
                      <span className="font-medium">{nextAchievement.name}</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-4 mb-2" />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatHours(currentAchievement?.requiredTime || 0)}</span>
                      <span>{formatHours(nextAchievement.requiredTime)}</span>
                    </div>
                    <p className="mt-4 text-center">
                      {user && (
                        <>
                          You've studied for <span className="font-semibold">{formatHours(user.totalStudyTime)}</span>. 
                          {nextAchievement && (
                            <>
                              {' '}Need <span className="font-semibold">{formatHours(nextAchievement.requiredTime - user.totalStudyTime)}</span> more to reach the next level.
                            </>
                          )}
                        </>
                      )}
                    </p>
                  </>
                ) : (
                  <p className="text-center py-4">
                    Congratulations! You've reached the highest achievement level!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* All Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>All Achievements</CardTitle>
              <CardDescription>
                {unlockedAchievements.length}/{achievements.length} achievements unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <Card 
                    key={achievement.id} 
                    className={`border ${achievement.unlocked ? 'border-primary/50' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                          achievement.unlocked 
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                        style={achievement.unlocked ? { 
                          backgroundColor: `hsl(${achievement.level * 30}, 70%, 85%)`,
                          color: `hsl(${achievement.level * 30}, 70%, 45%)`
                        } : {}}
                      >
                        {getIconComponent(achievement.icon)}
                      </div>
                      <h3 className="font-semibold mb-1">{achievement.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {achievement.description}
                      </p>
                      <div className="mt-2 text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                        {formatHours(achievement.requiredTime)}
                      </div>
                      {achievement.unlocked && (
                        <div className="mt-2 flex items-center">
                          <Award className="w-4 h-4 text-primary mr-1" />
                          <span className="text-xs text-primary">Unlocked</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </SidebarLayout>
  );
}
