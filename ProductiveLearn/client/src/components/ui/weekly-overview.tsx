import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { DailyStats } from '@shared/schema';

export function WeeklyOverview() {
  const [weekDates, setWeekDates] = useState<string[]>([]);
  
  // Generate the dates for the current week
  useEffect(() => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Adjust to start from Monday
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    setWeekDates(dates);
  }, []);
  
  // Fetch stats for the week
  const { data: weeklyStats = [] } = useQuery<DailyStats[]>({
    queryKey: ['/api/stats/daily', weekDates[0], weekDates[6]],
    queryFn: async () => {
      if (!weekDates.length) return [];
      
      const res = await fetch(`/api/stats/daily?start=${weekDates[0]}&end=${weekDates[6]}`, {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch daily stats');
      }
      
      return res.json();
    },
    enabled: weekDates.length > 0,
  });
  
  // Get stats for each day
  const getStatForDay = (date: string) => {
    return weeklyStats.find(stat => stat.date === date) || {
      studyTime: 0,
      breakTime: 0,
      sleepTime: 0
    };
  };
  
  // Find the max values for scaling
  const maxStudyTime = Math.max(...weeklyStats.map(s => s.studyTime || 0), 3600 * 2); // Min 2h for scale
  const maxBreakTime = Math.max(...weeklyStats.map(s => s.breakTime || 0), 1800); // Min 30m for scale
  const maxSleepTime = Math.max(...weeklyStats.map(s => s.sleepTime || 0), 3600 * 8); // Min 8h for scale
  
  // Day labels
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Weekly Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-60">
          <div className="flex h-48 items-end space-x-2">
            {weekDates.map((date, index) => {
              const stats = getStatForDay(date);
              const studyHeight = stats.studyTime ? (stats.studyTime / maxStudyTime) * 100 : 0;
              const breakHeight = stats.breakTime ? (stats.breakTime / maxBreakTime) * 100 : 0;
              const sleepHeight = stats.sleepTime ? (stats.sleepTime / maxSleepTime) * 100 : 0;
              
              return (
                <div key={date} className="flex-1 flex flex-col items-center space-y-1">
                  <div className="flex flex-col h-full w-full justify-end space-y-1">
                    <div className="bg-yellow-500 dark:bg-yellow-600 w-full" style={{ height: `${sleepHeight}%` }}></div>
                    <div className="bg-blue-500 dark:bg-blue-600 w-full" style={{ height: `${breakHeight}%` }}></div>
                    <div className="bg-green-500 dark:bg-green-600 w-full" style={{ height: `${studyHeight}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{dayLabels[index]}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-center space-x-6 mt-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-600 mr-2"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Study</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-600 mr-2"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Break</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 dark:bg-yellow-600 mr-2"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Sleep</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
