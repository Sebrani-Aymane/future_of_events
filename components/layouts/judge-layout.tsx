'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Gavel,
  ClipboardList,
  CheckCircle,
  BarChart3,
  LogOut,
  Menu,
  X,
  Zap,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Avatar, Badge, Progress } from '@/components/ui';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface JudgeLayoutProps {
  children: ReactNode;
  eventSlug: string;
  eventName: string;
  judge: {
    name: string;
    email: string;
    avatar?: string;
    specialty?: string;
  };
  progress?: {
    completed: number;
    total: number;
  };
  currentProject?: {
    index: number;
    total: number;
    name?: string;
  };
}

export function JudgeLayout({
  children,
  eventSlug,
  eventName,
  judge,
  progress,
  currentProject,
}: JudgeLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Judge navigation items
  const judgeNavItems: NavItem[] = [
    {
      label: 'Queue',
      href: `/judge/${eventSlug}`,
      icon: <ClipboardList className="h-5 w-5" />,
      badge: progress ? progress.total - progress.completed : undefined,
    },
    {
      label: 'Completed',
      href: `/judge/${eventSlug}/completed`,
      icon: <CheckCircle className="h-5 w-5" />,
      badge: progress?.completed,
    },
    {
      label: 'Criteria',
      href: `/judge/${eventSlug}/criteria`,
      icon: <Gavel className="h-5 w-5" />,
    },
    {
      label: 'Statistics',
      href: `/judge/${eventSlug}/stats`,
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string) => pathname === href;
  const progressPercentage = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

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
            <Badge variant="gold" size="sm">
              Judge
            </Badge>
            <span className="font-display font-bold">{eventName}</span>
          </div>

          <Avatar src={judge.avatar} name={judge.name} size="sm" />
        </div>

        {/* Mobile Progress Bar */}
        {progress && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-medium">
                {progress.completed}/{progress.total}
              </span>
            </div>
            <Progress value={progressPercentage} size="sm" showLabel={false} />
          </div>
        )}
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
              <JudgeSidebarContent
                eventSlug={eventSlug}
                eventName={eventName}
                judge={judge}
                navItems={judgeNavItems}
                progress={progress}
                isActive={isActive}
                onClose={() => setIsSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-72 bg-charcoal border-r border-white/10 z-40">
        <JudgeSidebarContent
          eventSlug={eventSlug}
          eventName={eventName}
          judge={judge}
          navItems={judgeNavItems}
          progress={progress}
          isActive={isActive}
        />
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pt-24 lg:pt-0 lg:pl-72">
        {/* Project Navigation Header (Desktop) */}
        {currentProject && (
          <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-white/10 bg-charcoal/50">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">
                Project {currentProject.index} of {currentProject.total}
              </span>
              {currentProject.name && (
                <span className="font-semibold">{currentProject.name}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentProject.index === 1}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium px-3">
                {currentProject.index}/{currentProject.total}
              </span>
              <button
                disabled={currentProject.index === currentProject.total}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

// Judge Sidebar Content Component
interface JudgeSidebarContentProps {
  eventSlug: string;
  eventName: string;
  judge: JudgeLayoutProps['judge'];
  navItems: NavItem[];
  progress?: JudgeLayoutProps['progress'];
  isActive: (href: string) => boolean;
  onClose?: () => void;
}

function JudgeSidebarContent({
  eventSlug,
  eventName,
  judge,
  navItems,
  progress,
  isActive,
  onClose,
}: JudgeSidebarContentProps) {
  const progressPercentage = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center shrink-0">
            <Gavel className="h-5 w-5 text-deep-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-gold line-clamp-1">
              {eventName}
            </span>
            <span className="text-xs text-muted-foreground">Judge Portal</span>
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

      {/* Judge Info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Avatar src={judge.avatar} name={judge.name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{judge.name}</div>
            {judge.specialty && (
              <div className="text-xs text-muted-foreground truncate">
                {judge.specialty}
              </div>
            )}
            <Badge variant="gold" size="sm" className="mt-1">
              Judge
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      {progress && (
        <div className="p-4 border-b border-white/10">
          <div className="bg-charcoal-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Scoring Progress</span>
              <span className="text-gold font-bold">{progressPercentage}%</span>
            </div>

            <Progress
              value={progressPercentage}
              size="md"
              showLabel={false}
              color="gold"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>{progress.completed} completed</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{progress.total - progress.completed} remaining</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              isActive(item.href)
                ? 'bg-gold/20 text-gold'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            )}
          >
            {item.icon}
            <span className="flex-1 font-medium">{item.label}</span>
            {item.badge !== undefined && (
              <Badge
                variant={isActive(item.href) ? 'gold' : 'secondary'}
                size="sm"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href={`/judge/${eventSlug}/help`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-white/5"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="font-medium">Scoring Guide</span>
        </Link>

        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200 text-destructive hover:bg-destructive/10">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default JudgeLayout;
