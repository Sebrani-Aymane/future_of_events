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
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap,
  Calendar,
  Megaphone,
  BarChart3,
  Gavel,
  DollarSign,
  FileText,
  PieChart,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { UserAvatar, Badge } from '@/components/ui';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  children?: Omit<NavItem, 'children'>[];
}

interface AdminLayoutProps {
  children: ReactNode;
  eventSlug: string;
  eventName: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'super_admin';
  };
  stats?: {
    participants: number;
    teams: number;
    projects: number;
  };
}

export function AdminLayout({
  children,
  eventSlug,
  eventName,
  user,
  stats,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Admin navigation items
  const adminNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: `/admin/${eventSlug}`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: 'Event Settings',
      href: `/admin/${eventSlug}/settings`,
      icon: <Calendar className="h-5 w-5" />,
      children: [
        {
          label: 'General',
          href: `/admin/${eventSlug}/settings/general`,
          icon: <Settings className="h-4 w-4" />,
        },
        {
          label: 'Registration',
          href: `/admin/${eventSlug}/settings/registration`,
          icon: <Users className="h-4 w-4" />,
        },
        {
          label: 'Judging',
          href: `/admin/${eventSlug}/settings/judging`,
          icon: <Gavel className="h-4 w-4" />,
        },
        {
          label: 'Prizes',
          href: `/admin/${eventSlug}/settings/prizes`,
          icon: <Trophy className="h-4 w-4" />,
        },
      ],
    },
    {
      label: 'Participants',
      href: `/admin/${eventSlug}/participants`,
      icon: <Users className="h-5 w-5" />,
      badge: stats?.participants,
    },
    {
      label: 'Teams',
      href: `/admin/${eventSlug}/teams`,
      icon: <Users className="h-5 w-5" />,
      badge: stats?.teams,
    },
    {
      label: 'Projects',
      href: `/admin/${eventSlug}/projects`,
      icon: <FolderOpen className="h-5 w-5" />,
      badge: stats?.projects,
    },
    {
      label: 'Judging',
      href: `/admin/${eventSlug}/judging`,
      icon: <Gavel className="h-5 w-5" />,
      children: [
        {
          label: 'Judges',
          href: `/admin/${eventSlug}/judging/judges`,
          icon: <Users className="h-4 w-4" />,
        },
        {
          label: 'Criteria',
          href: `/admin/${eventSlug}/judging/criteria`,
          icon: <FileText className="h-4 w-4" />,
        },
        {
          label: 'Progress',
          href: `/admin/${eventSlug}/judging/progress`,
          icon: <BarChart3 className="h-4 w-4" />,
        },
      ],
    },
    {
      label: 'Sponsors',
      href: `/admin/${eventSlug}/sponsors`,
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      label: 'Announcements',
      href: `/admin/${eventSlug}/announcements`,
      icon: <Megaphone className="h-5 w-5" />,
    },
    {
      label: 'Leaderboard',
      href: `/admin/${eventSlug}/leaderboard`,
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      label: 'Analytics',
      href: `/admin/${eventSlug}/analytics`,
      icon: <PieChart className="h-5 w-5" />,
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      label: 'Access Control',
      href: `/admin/${eventSlug}/access`,
      icon: <Shield className="h-5 w-5" />,
    },
    {
      label: 'Settings',
      href: `/admin/${eventSlug}/settings`,
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    return item.children?.some((child) => isActive(child.href));
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = hasChildren ? isParentActive(item) : isActive(item.href);

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200',
              active
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            )}
          >
            {item.icon}
            <span className="flex-1 font-medium text-left">{item.label}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-4 pl-4 border-l border-white/10 mt-1 space-y-1">
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href as any}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm',
                        isActive(child.href)
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      )}
                    >
                      {child.icon}
                      <span className="font-medium">{child.label}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href as any}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          active
            ? 'bg-primary/20 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
        )}
      >
        {item.icon}
        <span className="flex-1 font-medium">{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" size="sm">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

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

          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm">
              Admin
            </Badge>
            <span className="font-display font-bold">{eventName}</span>
          </div>

          <UserAvatar src={user.avatar} name={user.name} size="sm" />
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
              <AdminSidebarContent
                eventSlug={eventSlug}
                eventName={eventName}
                user={user}
                navItems={adminNavItems}
                bottomNavItems={bottomNavItems}
                renderNavItem={renderNavItem}
                onClose={() => setIsSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-charcoal border-r border-white/10 z-40">
        <AdminSidebarContent
          eventSlug={eventSlug}
          eventName={eventName}
          user={user}
          navItems={adminNavItems}
          bottomNavItems={bottomNavItems}
          renderNavItem={renderNavItem}
        />
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pt-16 lg:pt-0 lg:pl-64">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

// Admin Sidebar Content Component
interface AdminSidebarContentProps {
  eventSlug: string;
  eventName: string;
  user: AdminLayoutProps['user'];
  navItems: NavItem[];
  bottomNavItems: NavItem[];
  renderNavItem: (item: NavItem) => React.ReactNode;
  onClose?: () => void;
}

function AdminSidebarContent({
  eventSlug,
  eventName,
  user,
  navItems,
  bottomNavItems,
  renderNavItem,
  onClose,
}: AdminSidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-neon-orange flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-accent line-clamp-1">
              {eventName}
            </span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <UserAvatar src={user.avatar} name={user.name} size="default" />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{user.name}</div>
            <Badge variant="secondary" size="sm" className="mt-1">
              {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-white/10 space-y-1">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href as any}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        <Link
          href={`/dashboard/${eventSlug}` as any}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-primary hover:bg-primary/10"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="font-medium">View as Participant</span>
        </Link>

        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200 text-destructive hover:bg-destructive/10">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default AdminLayout;
