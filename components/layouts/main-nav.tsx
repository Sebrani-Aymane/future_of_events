'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  Menu,
  X,
  Calendar,
  Users,
  Trophy,
  LogIn,
  UserPlus,
  ChevronDown,
  Zap,
  Globe,
  Award,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: { label: string; href: string; description: string; icon?: React.ReactNode }[];
}

interface MainNavProps {
  eventSlug?: string;
  isAuthenticated?: boolean;
  userName?: string;
  userRole?: 'participant' | 'admin' | 'judge';
}

const defaultNavItems: NavItem[] = [
  { label: 'About', href: '#about', icon: <Globe className="h-4 w-4" /> },
  { label: 'Schedule', href: '#schedule', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Prizes', href: '#prizes', icon: <Trophy className="h-4 w-4" /> },
  { label: 'Sponsors', href: '#sponsors', icon: <Award className="h-4 w-4" /> },
  { label: 'FAQ', href: '#faq', icon: <Zap className="h-4 w-4" /> },
];

export function MainNav({
  eventSlug,
  isAuthenticated = false,
  userName,
  userRole,
}: MainNavProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const getDashboardLink = () => {
    if (!isAuthenticated) return null;
    
    switch (userRole) {
      case 'admin':
        return `/admin/${eventSlug}`;
      case 'judge':
        return `/judge/${eventSlug}`;
      case 'participant':
      default:
        return `/dashboard/${eventSlug}`;
    }
  };

  const dashboardLink = getDashboardLink();

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-foreground/[0.06] py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                className="relative h-10 w-10 rounded-xl bg-foreground flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="h-5 w-5 text-background" />
                <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-tight text-foreground">
                  HACKATHON
                </span>
                <span className="text-xs text-foreground/40 font-mono">
                  1337.EVENTS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {defaultNavItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.children ? (
                    <button
                      className={cn(
                        'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                        'text-foreground/70 hover:text-foreground hover:bg-white/5',
                        activeDropdown === item.label && 'text-foreground bg-white/5'
                      )}
                    >
                      {item.icon}
                      {item.label}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          activeDropdown === item.label && 'rotate-180'
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                        'text-foreground/70 hover:text-foreground hover:bg-white/5'
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {item.children && activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-foreground/10 bg-charcoal-500/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors group"
                            >
                              {child.icon && (
                                <div className="mt-0.5 p-2 rounded-lg bg-foreground/5 text-foreground group-hover:bg-foreground/10">
                                  {child.icon}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-sm text-foreground">
                                  {child.label}
                                </div>
                                <div className="text-xs text-foreground/50 mt-0.5">
                                  {child.description}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Desktop Auth Buttons */}
              <div className="hidden lg:flex items-center gap-3">
                {isAuthenticated && dashboardLink ? (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href={dashboardLink}>
                        <Users className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/5 border border-foreground/10">
                      <div className="h-8 w-8 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-sm">
                        {userName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium">{userName}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-foreground/5 transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-background border-l border-foreground/[0.06] z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6 pt-20">
                {/* Mobile Nav Items */}
                <nav className="space-y-1">
                  {defaultNavItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Divider */}
                <div className="my-6 border-t border-foreground/[0.06]" />

                {/* Mobile Auth Section */}
                <div className="space-y-3">
                  {isAuthenticated && dashboardLink ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-foreground/5 border border-foreground/10">
                        <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center text-background font-bold">
                          {userName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium">{userName}</div>
                          <div className="text-xs text-foreground/50 capitalize">
                            {userRole}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={dashboardLink}>
                          <Users className="mr-2 h-4 w-4" />
                          Go to Dashboard
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/login">
                          <LogIn className="mr-2 h-4 w-4" />
                          Sign In
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/register">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Register Now
                        </Link>
                      </Button>
                    </>
                  )}
                </div>

                {/* Footer Info */}
                <div className="mt-8 pt-6 border-t border-foreground/[0.06]">
                  <p className="text-xs text-foreground/40 text-center">
                    Powered by{' '}
                    <span className="text-foreground font-semibold">1337 Events</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default MainNav;
