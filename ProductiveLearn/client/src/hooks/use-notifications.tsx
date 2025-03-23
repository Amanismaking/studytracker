import { createContext, ReactNode, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Notification } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface NotificationsContextType {
  notifications: Notification[];
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: number) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery<Notification[], Error>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refresh when window gets focus
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('POST', `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAsRead = async (id: number) => {
    await markAsReadMutation.mutateAsync(id);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        isLoading,
        error,
        markAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
