import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/use-notifications';
import { Award, Bell, Users, Moon } from 'lucide-react';
import { Link } from 'wouter';

export function NotificationsList() {
  const { notifications, isLoading, markAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="w-4 h-4" />;
      case 'break':
        return <Bell className="w-4 h-4" />;
      case 'social':
        return <Users className="w-4 h-4" />;
      case 'sleep':
        return <Moon className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

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
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center justify-between">
          <span>Notifications</span>
          {!isLoading && notifications.filter(n => !n.read).length > 0 && (
            <Badge variant="default" className="ml-2 bg-primary text-white">
              {notifications.filter(n => !n.read).length} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg ${
                  !notification.read ? 'bg-gray-50 dark:bg-gray-700/30' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex">
                  <div className={`p-2 rounded-full ${getNotificationColorClass(notification.type)} mr-3`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="ml-2 self-start mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="mt-2 p-2 text-center">
              <Button variant="link" asChild>
                <Link href="/notifications" className="text-sm text-primary hover:text-indigo-700 dark:hover:text-indigo-300">
                  View All Notifications
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
