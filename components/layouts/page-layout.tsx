'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { MainNav } from './main-nav';
import { Footer } from './footer';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  showNav?: boolean;
  showFooter?: boolean;
  navProps?: {
    eventSlug?: string;
    isAuthenticated?: boolean;
    userName?: string;
    userRole?: 'participant' | 'admin' | 'judge';
  };
  footerProps?: {
    eventName?: string;
    organizerName?: string;
    showNewsletter?: boolean;
  };
}

export function PageLayout({
  children,
  className,
  showNav = true,
  showFooter = true,
  navProps,
  footerProps,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-deep-black">
      {showNav && <MainNav {...navProps} />}
      <main className={cn('flex-1', className)}>{children}</main>
      {showFooter && <Footer {...footerProps} />}
    </div>
  );
}

// Simple container component for consistent spacing
interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padded?: boolean;
}

const containerSizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function Container({
  children,
  className,
  size = 'xl',
  padded = true,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        containerSizes[size],
        padded && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}

// Section component for consistent vertical spacing
interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  background?: 'default' | 'muted' | 'gradient' | 'pattern';
}

const sectionPadding = {
  none: '',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-24',
  xl: 'py-24 md:py-32',
};

const sectionBackgrounds = {
  default: '',
  muted: 'bg-charcoal/50',
  gradient: 'bg-gradient-to-b from-transparent via-primary/5 to-transparent',
  pattern: 'grid-pattern',
};

export function Section({
  children,
  className,
  id,
  padding = 'lg',
  background = 'default',
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative',
        sectionPadding[padding],
        sectionBackgrounds[background],
        className
      )}
    >
      {children}
    </section>
  );
}

// Hero section wrapper with background effects
interface HeroSectionProps {
  children: ReactNode;
  className?: string;
  showGrid?: boolean;
  showBlobs?: boolean;
}

export function HeroSection({
  children,
  className,
  showGrid = true,
  showBlobs = true,
}: HeroSectionProps) {
  return (
    <section className={cn('relative min-h-screen flex items-center pt-20', className)}>
      {/* Background Effects */}
      {showGrid && (
        <div className="absolute inset-0 grid-pattern opacity-50" />
      )}
      
      {showBlobs && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary blob */}
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/30 rounded-full blur-[100px] animate-blob" />
          {/* Secondary blob */}
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
          {/* Tertiary blob */}
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-success/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-black/50 to-deep-black pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  );
}

// Auth layout for login/register pages
interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showLogo?: boolean;
}

export function AuthLayout({
  children,
  title,
  description,
  showLogo = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-deep-black flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-charcoal to-deep-black" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-[80px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <h1 className="font-display text-4xl xl:text-5xl font-bold text-gradient mb-6">
            Build the Future
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Join thousands of developers competing to create innovative solutions
            at Africa&apos;s premier hackathon platform.
          </p>
          
          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-gradient">5K+</div>
              <div className="text-sm text-muted-foreground">Developers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient">50+</div>
              <div className="text-sm text-muted-foreground">Events</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient">$1M+</div>
              <div className="text-sm text-muted-foreground">In Prizes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20">
        <div className="max-w-md w-full mx-auto">
          {showLogo && (
            <div className="lg:hidden mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                <span className="text-deep-black font-bold text-xl">H</span>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export default PageLayout;
