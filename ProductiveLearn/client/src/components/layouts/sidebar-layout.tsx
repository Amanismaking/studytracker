import { ReactNode, useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Timer, 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AvatarWithBadge } from '@/components/ui/avatar-with-badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'light';
    }
    return 'light';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { path: '/subjects', label: 'Subjects', icon: <BookOpen className="w-5 h-5 mr-3" /> },
    { path: '/achievements', label: 'Achievements', icon: <Award className="w-5 h-5 mr-3" /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <Users className="w-5 h-5 mr-3" /> },
    { path: '/statistics', label: 'Statistics', icon: <BarChart3 className="w-5 h-5 mr-3" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="w-64 hidden md:block bg-white dark:bg-gray-800 shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-primary dark:text-indigo-400 flex items-center">
            <Timer className="w-6 h-6 mr-2" />
            StudyTrack
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your productivity companion</p>
        </div>
        
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={`flex items-center px-2 py-2 rounded-lg ${
                    location === item.path 
                      ? 'bg-indigo-50 dark:bg-indigo-900 text-primary dark:text-indigo-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.icon}
                    {item.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <AvatarWithBadge 
              user={user} 
              className="w-10 h-10 rounded-full border-2 border-green-500" 
            />
            <div className="ml-3">
              <p className="text-sm font-semibold">{user?.displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.level}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile top navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-10 px-4 py-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary dark:text-indigo-400 flex items-center">
          <Timer className="w-5 h-5 mr-1" />
          StudyTrack
        </h1>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="mr-2">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile sidebar (hidden by default) */}
      {isMobile && (
        <div className={`fixed inset-0 z-20 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:hidden`}>
          <div className="absolute inset-0 bg-gray-800 opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg">
            {/* Close button */}
            <div className="flex justify-end p-4">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
            
            {/* Mobile sidebar content (same as desktop sidebar) */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-primary dark:text-indigo-400 flex items-center">
                <Timer className="w-6 h-6 mr-2" />
                StudyTrack
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your productivity companion</p>
            </div>
            
            <nav className="px-4 py-6">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <a className={`flex items-center px-2 py-2 rounded-lg ${
                        location === item.path 
                          ? 'bg-indigo-50 dark:bg-indigo-900 text-primary dark:text-indigo-300' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`} onClick={() => setMobileMenuOpen(false)}>
                        {item.icon}
                        {item.label}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <AvatarWithBadge 
                  user={user} 
                  className="w-10 h-10 rounded-full border-2 border-green-500" 
                />
                <div className="ml-3">
                  <p className="text-sm font-semibold">{user?.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.level}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-4 md:pt-0 pb-4 px-4 mt-14 md:mt-0">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Theme toggle for desktop */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 w-10 h-10"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      )}
    </div>
  );
}
