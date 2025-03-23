import { User } from '@shared/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface AvatarWithBadgeProps {
  user: User | null;
  className?: string;
  showBadge?: boolean;
  fallback?: string;
}

export function AvatarWithBadge({ 
  user, 
  className = '',
  showBadge = true,
  fallback = ''
}: AvatarWithBadgeProps) {
  // Generate initials from display name
  const initials = user?.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : fallback || '?';
  
  // Get border color based on level
  const getBorderColorClass = () => {
    if (!user) return 'border-gray-300';
    
    switch (user.level) {
      case 'Student': return 'border-green-500';
      case 'Specs Nerd': return 'border-blue-500';
      case 'Hardcore Student': return 'border-indigo-500';
      case 'Workaholic': return 'border-red-500';
      case 'King': return 'border-amber-500';
      case 'God-level Studier': return 'border-purple-500';
      default: return 'border-gray-300';
    }
  };
  
  // Get badge icon based on level
  const getBadgeIcon = () => {
    if (!user) return null;
    
    return <Star className="w-3 h-3" />;
  };
  
  // Get badge color based on level
  const getBadgeColorClass = () => {
    if (!user) return 'bg-gray-400';
    
    switch (user.level) {
      case 'Student': return 'bg-green-500';
      case 'Specs Nerd': return 'bg-blue-500';
      case 'Hardcore Student': return 'bg-indigo-500';
      case 'Workaholic': return 'bg-red-500';
      case 'King': return 'bg-amber-500';
      case 'God-level Studier': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="relative">
      <Avatar className={`${className} ${getBorderColorClass()}`}>
        <AvatarImage src="" alt={user?.displayName || 'User'} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {showBadge && user && (
        <div className={`absolute -bottom-1 -right-1 ${getBadgeColorClass()} text-white rounded-full w-5 h-5 flex items-center justify-center text-xs`}>
          {getBadgeIcon()}
        </div>
      )}
    </div>
  );
}
