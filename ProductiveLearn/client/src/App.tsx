import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { TimerProvider } from "@/hooks/use-timer";
import { SubjectsProvider } from "@/hooks/use-subjects";
import { AchievementsProvider } from "@/hooks/use-achievements";
import { LeaderboardProvider } from "@/hooks/use-leaderboard";
import { NotificationsProvider } from "@/hooks/use-notifications";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import SubjectsPage from "@/pages/subjects-page";
import AchievementsPage from "@/pages/achievements-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import StatisticsPage from "@/pages/statistics-page";
import SettingsPage from "@/pages/settings-page";
import NotificationsPage from "@/pages/notifications-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/subjects" component={SubjectsPage} />
      <ProtectedRoute path="/achievements" component={AchievementsPage} />
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      <ProtectedRoute path="/statistics" component={StatisticsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TimerProvider>
          <SubjectsProvider>
            <AchievementsProvider>
              <LeaderboardProvider>
                <NotificationsProvider>
                  <Router />
                  <Toaster />
                </NotificationsProvider>
              </LeaderboardProvider>
            </AchievementsProvider>
          </SubjectsProvider>
        </TimerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
