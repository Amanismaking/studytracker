import { useState } from "react";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/use-notifications";
import { Award, Bell, Users, Moon, CheckCircle, BellOff } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead } = useNotifications();
  const [filter, setFilter] = useState<string>("all");
  
  // Filter notifications based on tab
  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });
  
  // Mark all as read
  const markAllAsRead = async () => {
    for (const notification of notifications.filter(n => !n.read)) {
      await markAsRead(notification.id);
    }
  };
  
  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="w-5 h-5" />;
      case 'break':
        return <Bell className="w-5 h-5" />;
      case 'social':
        return <Users className="w-5 h-5" />;
      case 'sleep':
        return <Moon className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Get notification color class
  const getNotificationColorClass = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400';
      case 'break':
        return 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400';
      case 'social':
        return 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'sleep':
        return 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <SidebarLayout>
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400">Stay updated on your achievements and reminders</p>
        </div>
        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={!notifications.some(n => !n.read)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Your Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setFilter}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="achievement">Achievements</TabsTrigger>
              <TabsTrigger value="break">Breaks</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
            
            <TabsContent value={filter}>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <BellOff className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {filter === "unread" 
                      ? "You've read all your notifications!" 
                      : "You don't have any notifications yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 rounded-lg transition-colors ${
                        !notification.read ? 'bg-gray-50 dark:bg-gray-800/60' : ''
                      } hover:bg-gray-100 dark:hover:bg-gray-800`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex">
                        <div className={`p-3 rounded-full ${getNotificationColorClass(notification.type)} mr-4`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium mb-1">{notification.message}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="ml-2">
                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}
