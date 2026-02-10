'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Trophy,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  eventSlug: string;
  eventName: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: 'participant' | 'admin' | 'judge';
    teamName?: string;
  };
  notifications?: number;
}

export function DashboardLayout({
  children,
  eventSlug,
  eventName,
  user,
  notifications = 0,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Participant navigation items
  const participantNavItems: NavItem[] = [
    {
      label: 'Overview',
      href: `/dashboard/${eventSlug}`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: 'My Team',
      href: `/dashboard/${eventSlug}/team`,
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: 'Project',
      href: `/dashboard/${eventSlug}/project`,
      icon: <FolderOpen className="h-5 w-5" />,
    },
    {
      label: 'Leaderboard',
      href: `/dashboard/${eventSlug}/leaderboard`,
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      label: 'Announcements',
      href: `/dashboard/${eventSlug}/announcements`,
      icon: <Bell className="h-5 w-5" />,
      badge: notifications > 0 ? notifications : undefined,
    },
    {
      label: 'Chat',
      href: `/dashboard/${eventSlug}/chat`,
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      label: 'Help',
      href: `/dashboard/${eventSlug}/help`,
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      label: 'Settings',
      href: `/dashboard/${eventSlug}/settings`,
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-deep-black">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-deep-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-deep-black" />
            </div>
            <span className="font-display font-bold text-gradient">{eventName}</span>
          </Link>

          <div className="relative">
            <Link href={`/dashboard/${eventSlug}/notifications`}>
              <Bell className="h-6 w-6" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-charcoal border-r border-white/10 z-50 lg:hidden overflow-y-auto"
            >
              <SidebarContent
                eventSlug={eventSlug}
                eventName={eventName}
                user={user}
                navItems={participantNavItems}
                bottomNavItems={bottomNavItems}
                isActive={isActive}
                onClose={() => setIsSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed top-0 left-0 bottom-0 bg-charcoal border-r border-white/10 z-40 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <SidebarContent
          eventSlug={eventSlug}
          eventName={eventName}
          user={user}
          navItems={participantNavItems}
          bottomNavItems={bottomNavItems}
          isActive={isActive}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen pt-16 lg:pt-0 transition-all duration-300',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

// Sidebar Content Component
interface SidebarContentProps {
  eventSlug: string;
  eventName: string;
  user: DashboardLayoutProps['user'];
  navItems: NavItem[];
  bottomNavItems: NavItem[];
  isActive: (href: string) => boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

function SidebarContent({
  eventSlug,
  eventName,
  user,
  navItems,
  bottomNavItems,
  isActive,
  isCollapsed = false,
  onClose,
  onToggleCollapse,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Link href="/" className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-deep-black" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-gradient line-clamp-1">
                {eventName}
              </span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          )}
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight
              className={cn(
                'h-5 w-5 transition-transform',
                isCollapsed && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className={cn('p-4 border-b border-white/10', isCollapsed && 'flex justify-center')}>
        <div className={cn('flex items-center gap-3', isCollapsed && 'flex-col')}>
          <Avatar
            src={user.avatar}
            name={user.name}
            size={isCollapsed ? 'sm' : 'md'}
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{user.name}</div>
              {user.teamName && (
                <div className="text-xs text-muted-foreground truncate">
                  Team: {user.teamName}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              isActive(item.href)
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
              isCollapsed && 'justify-center'
            )}
          >
            {item.icon}
            {!isCollapsed && (
              <>
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="primary" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-white/10 space-y-1">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              isActive(item.href)
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
              isCollapsed && 'justify-center'
            )}
          >
            {item.icon}
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}

        <button
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200',
            'text-destructive hover:bg-destructive/10',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

export default DashboardLayout;
