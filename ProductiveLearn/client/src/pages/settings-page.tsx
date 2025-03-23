import { useState } from "react";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Bell, 
  User, 
  Lock, 
  Palette, 
  Moon, 
  Volume2, 
  LogOut, 
  Save 
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  
  // Settings state
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [notifications, setNotifications] = useState(true);
  const [breakReminders, setBreakReminders] = useState(true);
  const [sound, setSound] = useState(true);
  const [dailyGoalHours, setDailyGoalHours] = useState(
    user?.dailyGoal ? Math.floor(user.dailyGoal / 3600) : 8
  );
  
  // Form state for profile
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    const root = window.document.documentElement;
    if (newDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  // Handle save profile
  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated.",
    });
  };
  
  // Daily goal mutation
  const updateDailyGoalMutation = useMutation({
    mutationFn: async (dailyGoalInSeconds: number) => {
      if (!user) throw new Error("User not authenticated");
      const res = await apiRequest("PATCH", `/api/user/daily-goal`, { dailyGoal: dailyGoalInSeconds });
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Daily Goal Updated",
        description: "Your daily study goal has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle save preferences
  const handleSavePreferences = () => {
    // Convert hours to seconds for storage
    const dailyGoalInSeconds = dailyGoalHours * 3600;
    updateDailyGoalMutation.mutate(dailyGoalInSeconds);
    
    toast({
      title: "Preferences Saved",
      description: "Your other preferences have been updated.",
    });
  };
  
  // Handle logout
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <SidebarLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account settings and preferences</p>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account">
            <Lock className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Palette className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={user?.username || ""} disabled />
                <p className="text-xs text-gray-500">Your username cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                />
                <p className="text-xs text-gray-500">This is the name displayed to other users</p>
              </div>
              
              <div className="space-y-2">
                <Label>Your Level</Label>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="font-medium">{user?.level}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Keep studying to unlock higher levels
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-6">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Update Password
              </Button>
              
              <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-red-500 mb-2">Danger Zone</h3>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout of All Devices
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Appearance & Preferences</CardTitle>
              <CardDescription>Customize how StudyTrack looks and works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-gray-500">Enable dark mode for the application</p>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={handleThemeToggle} 
                  aria-label="Toggle dark mode"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Sound Effects</Label>
                  <p className="text-sm text-gray-500">Enable sound effects for timers and notifications</p>
                </div>
                <Switch 
                  checked={sound} 
                  onCheckedChange={setSound} 
                  aria-label="Toggle sound effects"
                />
              </div>
              
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-4">Daily Goal Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="daily-goal">Daily Study Goal (hours)</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="daily-goal" 
                      type="number" 
                      value={dailyGoalHours}
                      onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                      min="1" 
                      max="24" 
                      className="w-24"
                    />
                    <span>hours</span>
                  </div>
                  <p className="text-xs text-gray-500">Set a target number of hours to study each day</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-4">Timer Settings</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pomodoro-duration">Pomodoro Duration (minutes)</Label>
                      <Input id="pomodoro-duration" type="number" defaultValue="25" min="1" max="120" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="short-break">Short Break (minutes)</Label>
                      <Input id="short-break" type="number" defaultValue="5" min="1" max="30" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="long-break">Long Break (minutes)</Label>
                      <Input id="long-break" type="number" defaultValue="15" min="5" max="60" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sessions-before-long-break">Sessions Before Long Break</Label>
                      <Input id="sessions-before-long-break" type="number" defaultValue="4" min="1" max="10" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences}>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Notifications</Label>
                  <p className="text-sm text-gray-500">Allow StudyTrack to send you notifications</p>
                </div>
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications}
                  aria-label="Toggle notifications"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Break Reminders</Label>
                  <p className="text-sm text-gray-500">Get reminded to take breaks during long study sessions</p>
                </div>
                <Switch 
                  checked={breakReminders} 
                  onCheckedChange={setBreakReminders}
                  disabled={!notifications}
                  aria-label="Toggle break reminders"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Achievement Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified when you unlock new achievements</p>
                </div>
                <Switch 
                  checked={notifications}
                  disabled={!notifications}
                  aria-label="Toggle achievement notifications"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Leaderboard Updates</Label>
                  <p className="text-sm text-gray-500">Get notified about changes in the leaderboard</p>
                </div>
                <Switch 
                  checked={notifications}
                  disabled={!notifications}
                  aria-label="Toggle leaderboard notifications"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences}>
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
}
