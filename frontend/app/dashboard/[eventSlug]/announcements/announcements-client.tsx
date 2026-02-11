'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import {
  ArrowLeft,
  Bell,
  BellRing,
  Megaphone,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Input,
} from '@/components/ui';
import { DashboardLayout, Container } from '@/components/layouts';
import { supabase } from '@/lib/supabase/client';
import type { Event } from '@/types';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  is_pinned: boolean;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface AnnouncementsClientProps {
  eventSlug: string;
  event: Event;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: 'participant' | 'admin' | 'judge';
  };
  teamName?: string;
  announcements: Announcement[];
}

const typeConfig = {
  info: {
    icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  urgent: {
    icon: BellRing,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
};

function formatAnnouncementDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, yyyy \'at\' h:mm a');
}

export default function AnnouncementsClient({
  eventSlug,
  event,
  user,
  teamName,
  announcements,
}: AnnouncementsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'success' | 'urgent'>('all');

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter and search announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = searchQuery === '' || 
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || announcement.type === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Separate pinned from regular announcements
  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.is_pinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.is_pinned);

  return (
    <DashboardLayout
      eventSlug={eventSlug}
      eventName={event.name}
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        role: user.role,
        teamName,
      }}
      notifications={0}
    >
      <Container size="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href={`/dashboard/${eventSlug}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <Megaphone className="h-8 w-8 text-primary" />
                Announcements
              </h1>
              <p className="text-muted-foreground">
                Stay updated with the latest news and important information
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'info', 'warning', 'success', 'urgent'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(type)}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Announcements List */}
        <div className="space-y-4">
          {/* Pinned Announcements */}
          {pinnedAnnouncements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                Pinned
              </h2>
              {pinnedAnnouncements.map((announcement, index) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  isExpanded={expandedIds.has(announcement.id)}
                  onToggle={() => toggleExpand(announcement.id)}
                  delay={index * 0.05}
                />
              ))}
            </div>
          )}

          {/* Regular Announcements */}
          {regularAnnouncements.length > 0 && (
            <div className="space-y-4">
              {pinnedAnnouncements.length > 0 && (
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2 mt-8">
                  <Calendar className="h-4 w-4" />
                  Recent
                </h2>
              )}
              {regularAnnouncements.map((announcement, index) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  isExpanded={expandedIds.has(announcement.id)}
                  onToggle={() => toggleExpand(announcement.id)}
                  delay={(pinnedAnnouncements.length + index) * 0.05}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredAnnouncements.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-charcoal flex items-center justify-center">
                <Bell className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Announcements</h3>
              <p className="text-muted-foreground">
                {searchQuery || filter !== 'all'
                  ? 'No announcements match your search criteria'
                  : 'There are no announcements yet. Check back later!'}
              </p>
            </motion.div>
          )}
        </div>
      </Container>
    </DashboardLayout>
  );
}

function AnnouncementCard({
  announcement,
  isExpanded,
  onToggle,
  delay,
}: {
  announcement: Announcement;
  isExpanded: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const config = typeConfig[announcement.type];
  const Icon = config.icon;
  const isLong = announcement.content.length > 300;
  const displayContent = isExpanded || !isLong 
    ? announcement.content 
    : announcement.content.slice(0, 300) + '...';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`${config.bg} ${config.border} border`}>
        <Card.Content className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {announcement.is_pinned && (
                      <Badge variant="primary" className="mr-2 text-xs">
                        Pinned
                      </Badge>
                    )}
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    {formatAnnouncementDate(announcement.created_at)}
                    {announcement.author && (
                      <>
                        <span>•</span>
                        <span>by {announcement.author.full_name}</span>
                      </>
                    )}
                  </p>
                </div>
                <Badge variant={announcement.type === 'urgent' ? 'destructive' : 'secondary'}>
                  {announcement.type}
                </Badge>
              </div>
              
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-foreground/80 whitespace-pre-wrap">
                  {displayContent}
                </p>
              </div>

              {isLong && (
                <button
                  onClick={onToggle}
                  className="mt-3 text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Read more <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>
    </motion.div>
  );
}
