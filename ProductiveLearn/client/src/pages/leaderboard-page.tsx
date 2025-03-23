import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AvatarWithBadge } from "@/components/ui/avatar-with-badge";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useAuth } from "@/hooks/use-auth";
import { Medal, Clock } from "lucide-react";

// Helper function to format seconds into hours and minutes
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { leaderboard, timeFrame, setTimeFrame, isLoading } = useLeaderboard();
  
  // Find the highest study time for percentage calculation
  const maxStudyTime = leaderboard.length > 0 
    ? Math.max(...leaderboard.map(user => user.totalStudyTime))
    : 1; // Prevent division by zero

  return (
    <SidebarLayout>
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Compete with friends and see who studies the most</p>
        </div>
        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="This Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList className="mb-6">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="details">Detailed Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Study Time Rankings</CardTitle>
              <CardDescription>
                {timeFrame === 'today' && 'Today\'s rankings based on total study time'}
                {timeFrame === 'week' && 'This week\'s rankings based on total study time'}
                {timeFrame === 'month' && 'This month\'s rankings based on total study time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading leaderboard...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Medal className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No data available</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Start studying to appear on the leaderboard!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top 3 users with medals */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                    {/* 2nd place */}
                    {leaderboard.length > 1 && (
                      <div className="order-2 md:order-1 flex flex-col items-center">
                        <div className="relative mb-2">
                          <AvatarWithBadge 
                            user={leaderboard[1] as any} 
                            className="w-20 h-20" 
                            fallback={leaderboard[1].displayName.charAt(0)}
                          />
                          <div className="absolute -bottom-2 -right-2 bg-gray-300 dark:bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                            2
                          </div>
                        </div>
                        <h3 className="font-semibold">{leaderboard[1].isCurrentUser ? 'You' : leaderboard[1].displayName}</h3>
                        <p className="text-sm text-gray-500">{formatTime(leaderboard[1].totalStudyTime)}</p>
                      </div>
                    )}
                    
                    {/* 1st place */}
                    <div className="order-1 md:order-2 flex flex-col items-center">
                      <div className="relative mb-2">
                        <AvatarWithBadge 
                          user={leaderboard[0] as any} 
                          className="w-24 h-24 border-4 border-yellow-400" 
                          fallback={leaderboard[0].displayName.charAt(0)}
                        />
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white rounded-full w-10 h-10 flex items-center justify-center">
                          1
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg">{leaderboard[0].isCurrentUser ? 'You' : leaderboard[0].displayName}</h3>
                      <p className="text-gray-500">{formatTime(leaderboard[0].totalStudyTime)}</p>
                    </div>
                    
                    {/* 3rd place */}
                    {leaderboard.length > 2 && (
                      <div className="order-3 flex flex-col items-center">
                        <div className="relative mb-2">
                          <AvatarWithBadge 
                            user={leaderboard[2] as any} 
                            className="w-20 h-20" 
                            fallback={leaderboard[2].displayName.charAt(0)}
                          />
                          <div className="absolute -bottom-2 -right-2 bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center">
                            3
                          </div>
                        </div>
                        <h3 className="font-semibold">{leaderboard[2].isCurrentUser ? 'You' : leaderboard[2].displayName}</h3>
                        <p className="text-sm text-gray-500">{formatTime(leaderboard[2].totalStudyTime)}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Full leaderboard */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 text-center">Rank</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead className="text-right">Study Time</TableHead>
                          <TableHead>Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaderboard.map((user, index) => {
                          const percentage = (user.totalStudyTime / maxStudyTime) * 100;
                          
                          return (
                            <TableRow key={user.id} className={
                              user.isCurrentUser ? "bg-primary/5" : undefined
                            }>
                              <TableCell className="text-center font-medium">{index + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <AvatarWithBadge 
                                    user={user as any} 
                                    className="w-8 h-8 mr-2" 
                                    fallback={user.displayName.charAt(0)}
                                    showBadge={false}
                                  />
                                  <span className={user.isCurrentUser ? "font-medium" : undefined}>
                                    {user.isCurrentUser ? "You" : user.displayName}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{user.level}</TableCell>
                              <TableCell className="text-right font-mono">
                                {formatTime(user.totalStudyTime)}
                              </TableCell>
                              <TableCell>
                                <Progress 
                                  value={percentage} 
                                  className="h-2" 
                                  indicatorClassName={
                                    user.isCurrentUser ? "bg-primary" : undefined
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Study Time Analysis</CardTitle>
              <CardDescription>Detailed breakdown of study time across all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="mx-auto bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Detailed statistics will be available in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
}
