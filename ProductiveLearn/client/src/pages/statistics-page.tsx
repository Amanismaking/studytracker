import { useState } from "react";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { DailyStats } from "@shared/schema";
import { useSubjects } from "@/hooks/use-subjects";

// Helper function to format seconds into hours for display
function formatHours(seconds: number): number {
  return parseFloat((seconds / 3600).toFixed(1));
}

// Helper function to get the most recent n days
function getLastNDays(n: number): { date: string, label: string }[] {
  const result = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' });
    result.push({ date: dateStr, label });
  }
  return result;
}

export default function StatisticsPage() {
  const { subjects } = useSubjects();
  const [timeRange, setTimeRange] = useState<string>("week");
  
  // Get date ranges based on selected time range
  const daysToFetch = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 1;
  const dateRange = getLastNDays(daysToFetch);
  const startDate = dateRange[0].date;
  const endDate = dateRange[dateRange.length - 1].date;
  
  // Fetch stats for the selected time range
  const { data: statsData = [], isLoading } = useQuery<DailyStats[]>({
    queryKey: ['/api/stats/daily', startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/stats/daily?start=${startDate}&end=${endDate}`, {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch daily stats');
      }
      
      return res.json();
    },
    // Add real-time updates every 5 seconds
    refetchInterval: 5000,
    // Refresh when window gets focus
    refetchOnWindowFocus: true,
  });
  
  // Prepare data for time distribution chart
  const timeDistributionData = dateRange.map(({ date, label }) => {
    const dayStat = statsData.find(s => s.date === date) || { studyTime: 0, breakTime: 0, sleepTime: 0 };
    
    return {
      name: label,
      study: formatHours(dayStat.studyTime),
      break: formatHours(dayStat.breakTime),
      sleep: formatHours(dayStat.sleepTime),
    };
  });
  
  // Prepare data for subject distribution chart
  const subjectDistributionData = subjects.map(subject => {
    // Calculate total time for the subject across the selected time range
    let totalTime = 0;
    
    statsData.forEach(stat => {
      const subjectBreakdown = stat.subjectBreakdown as Record<string, number>;
      if (subjectBreakdown && subjectBreakdown[subject.id]) {
        totalTime += subjectBreakdown[subject.id];
      }
    });
    
    return {
      name: subject.name,
      value: formatHours(totalTime),
      color: subject.color,
    };
  }).filter(item => item.value > 0);
  
  // Calculate totals
  const totalStudyTime = statsData.reduce((sum, day) => sum + day.studyTime, 0);
  const totalBreakTime = statsData.reduce((sum, day) => sum + day.breakTime, 0);
  const totalSleepTime = statsData.reduce((sum, day) => sum + day.sleepTime, 0);
  
  // Format labels based on time range
  const timeRangeLabel = timeRange === "week" ? "This Week" : timeRange === "month" ? "This Month" : "Today";

  return (
    <SidebarLayout>
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Statistics</h1>
          <p className="text-gray-500 dark:text-gray-400">Analyze your study habits and productivity</p>
        </div>
        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="This Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Time Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Study Time</CardTitle>
            <CardDescription>{timeRangeLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{formatHours(totalStudyTime)}h</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Break Time</CardTitle>
            <CardDescription>{timeRangeLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{formatHours(totalBreakTime)}h</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sleep Time</CardTitle>
            <CardDescription>{timeRangeLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{formatHours(totalSleepTime)}h</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="time-distribution">
        <TabsList className="mb-6">
          <TabsTrigger value="time-distribution">Time Distribution</TabsTrigger>
          <TabsTrigger value="subject-distribution">Subject Distribution</TabsTrigger>
          <TabsTrigger value="trends">Trends & Patterns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="time-distribution">
          <Card>
            <CardHeader>
              <CardTitle>Time Distribution</CardTitle>
              <CardDescription>Breakdown of your study, break, and sleep time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading statistics...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={timeDistributionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${value} hours`, ""]} />
                    <Legend />
                    <Bar dataKey="study" name="Study Time" stackId="a" fill="#10B981" />
                    <Bar dataKey="break" name="Break Time" stackId="a" fill="#3B82F6" />
                    <Bar dataKey="sleep" name="Sleep Time" stackId="a" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subject-distribution">
          <Card>
            <CardHeader>
              <CardTitle>Subject Distribution</CardTitle>
              <CardDescription>Time spent on each subject during {timeRangeLabel.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading statistics...</p>
                </div>
              ) : subjectDistributionData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No subject data available for this time period
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={subjectDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({name, value}) => `${name}: ${value}h`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {subjectDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} hours`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Study Trends & Patterns</CardTitle>
              <CardDescription>Analyze your productivity patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Advanced trends and pattern analysis will be available in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
}
