import { useState } from "react";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { StatusCard } from "@/components/ui/status-card";
import { StudyTimer } from "@/components/ui/study-timer";
import { SubjectProgress } from "@/components/ui/subject-progress";
import { WeeklyOverview } from "@/components/ui/weekly-overview";
import { AchievementsDisplay } from "@/components/ui/achievements-display";
import { LeaderboardWidget } from "@/components/ui/leaderboard-widget";
import { NotificationsList } from "@/components/ui/notifications-list";
import { Button } from "@/components/ui/button";
import { AddSubjectDialog } from "@/components/dialogs/add-subject-dialog";
import { Timer, Coffee, Moon, PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

// Helper function to format seconds into hours and minutes
function formatTimeHM(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);

  // Fetch daily stats for today with real-time updates
  const today = new Date().toISOString().split('T')[0];
  const { data: dailyStats } = useQuery({
    queryKey: ['/api/stats/daily', today, today],
    queryFn: async () => {
      const res = await fetch(`/api/stats/daily?start=${today}&end=${today}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch daily stats');
      }
      return res.json();
    },
    // Refresh every 5 seconds for real-time updates
    refetchInterval: 5000,
    // Refresh when window gets focus
    refetchOnWindowFocus: true,
  });

  // Extract stats from the daily stats response (or use defaults)
  const todayStats = dailyStats && dailyStats.length > 0 ? dailyStats[0] : { studyTime: 0, breakTime: 0, sleepTime: 0 };
  
  // Target values (for progress bars)
  const studyTarget = 8 * 3600; // 8 hours in seconds
  const breakTarget = 1.5 * 3600; // 1.5 hours in seconds
  const sleepTarget = 8 * 3600; // 8 hours in seconds

  return (
    <SidebarLayout>
      {/* Top header with actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your study progress and achievements</p>
        </div>
        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <Button className="flex items-center" onClick={() => setShowAddSubjectDialog(true)}>
            <PlusCircle className="w-4 h-4 mr-1" />
            New Subject
          </Button>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatusCard 
          icon={<Timer className="w-5 h-5" />}
          iconBgClassName="bg-green-100 dark:bg-green-900/30"
          iconClassName="text-green-500"
          title="Total Study Time"
          value={formatTimeHM(todayStats.studyTime)}
          progressLabel={`Target: ${formatTimeHM(studyTarget)}`}
          progressValue={todayStats.studyTime}
          progressMax={studyTarget}
          progressClassName="bg-green-500"
        />
        
        <StatusCard 
          icon={<Coffee className="w-5 h-5" />}
          iconBgClassName="bg-blue-100 dark:bg-blue-900/30"
          iconClassName="text-blue-500"
          title="Break Time"
          value={formatTimeHM(todayStats.breakTime)}
          progressLabel={`Recommended: ${formatTimeHM(breakTarget)}`}
          progressValue={todayStats.breakTime}
          progressMax={breakTarget}
          progressClassName="bg-blue-500"
        />
        
        <StatusCard 
          icon={<Moon className="w-5 h-5" />}
          iconBgClassName="bg-yellow-100 dark:bg-yellow-900/30"
          iconClassName="text-yellow-500"
          title="Sleep Time"
          value={formatTimeHM(todayStats.sleepTime)}
          progressLabel={`Recommended: ${formatTimeHM(sleepTarget)}`}
          progressValue={todayStats.sleepTime}
          progressMax={sleepTarget}
          progressClassName="bg-yellow-500"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (spans 2 cols on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <StudyTimer />
          <SubjectProgress />
          <WeeklyOverview />
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          <AchievementsDisplay />
          <LeaderboardWidget />
          <NotificationsList />
        </div>
      </div>

      {/* Add Subject Dialog */}
      <AddSubjectDialog 
        open={showAddSubjectDialog} 
        onOpenChange={setShowAddSubjectDialog} 
      />
    </SidebarLayout>
  );
}
