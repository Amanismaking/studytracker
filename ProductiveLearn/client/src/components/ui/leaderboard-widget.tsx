import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AvatarWithBadge } from '@/components/ui/avatar-with-badge';
import { Progress } from '@/components/ui/progress';
import { useLeaderboard } from '@/hooks/use-leaderboard';
import { Link } from 'wouter';

// Function to format time
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function LeaderboardWidget() {
  const { leaderboard, timeFrame, setTimeFrame, isLoading } = useLeaderboard();
  
  // Find the highest study time for percentage calculation
  const maxStudyTime = leaderboard.length > 0 
    ? Math.max(...leaderboard.map(user => user.totalStudyTime))
    : 1; // Prevent division by zero

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between">
        <CardTitle>Leaderboard</CardTitle>
        <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)}>
          <SelectTrigger className="w-32 bg-gray-100 dark:bg-gray-700 border-0">
            <SelectValue placeholder="This Week" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <p>Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p>No data available for the leaderboard.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, 4).map((user, index) => {
              const percentage = (user.totalStudyTime / maxStudyTime) * 100;
              
              return (
                <div 
                  key={user.id} 
                  className={`flex items-center p-2 rounded-lg ${
                    index === 0 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  } ${
                    user.isCurrentUser 
                      ? 'ring-2 ring-primary/30'
                      : ''
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center mr-3">
                    <span className={`font-semibold ${
                      index === 0 
                        ? 'text-primary' 
                        : 'text-gray-500'
                    }`}>{index + 1}</span>
                  </div>
                  <AvatarWithBadge 
                    user={user as any} 
                    className="w-8 h-8 mr-3" 
                    fallback={user.displayName.charAt(0)}
                    showBadge={false}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{user.isCurrentUser ? 'You' : user.displayName}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{formatTime(user.totalStudyTime)}</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-1.5 mt-1 bg-primary/20" 
                      indicatorClassName="bg-primary"
                    />
                  </div>
                </div>
              );
            })}
            
            <div className="mt-4 flex justify-center">
              <Button variant="link" asChild>
                <Link href="/leaderboard" className="text-sm text-primary hover:text-indigo-700 dark:hover:text-indigo-300">
                  View Full Leaderboard
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
