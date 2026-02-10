'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Trophy,
  Zap,
} from 'lucide-react';
import { Button, Badge, Card, Input, Skeleton } from '@/components/ui';
import { PageLayout, Container, Section } from '@/components/layouts';
import { supabase } from '@/lib/supabase/client';
import type { Event } from '@/types';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';

function getEventStatus(event: Event): {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary';
  description: string;
} {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const registrationDeadline = new Date(event.registration_deadline);

  if (isPast(endDate)) {
    return { label: 'Ended', variant: 'secondary', description: 'This event has concluded' };
  }
  if (now >= startDate && now <= endDate) {
    return { label: 'Live Now', variant: 'success', description: 'Event is happening now!' };
  }
  if (isPast(registrationDeadline)) {
    return { label: 'Registration Closed', variant: 'warning', description: 'Registration has ended' };
  }
  if (event.is_registration_open) {
    return { label: 'Open for Registration', variant: 'success', description: 'Sign up now!' };
  }
  return { label: 'Coming Soon', variant: 'default', description: 'Registration opens soon' };
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const status = getEventStatus(event);
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const registrationDeadline = new Date(event.registration_deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/events/${event.slug}` as any}>
        <Card
          variant="glass"
          className="group h-full overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer"
          hover="lift"
        >
          {/* Cover Image */}
          <div className="relative h-48 overflow-hidden">
            {event.cover_image_url || event.banner_url ? (
              <img
                src={event.cover_image_url || event.banner_url || ''}
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${event.primary_color || '#00E5FF'}20, ${event.secondary_color || '#FF6B35'}20)`,
                }}
              >
                <Zap 
                  className="h-16 w-16 opacity-30" 
                  style={{ color: event.primary_color || '#00E5FF' }}
                />
              </div>
            )}
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent" />
          </div>

          <Card.Content className="p-6">
            {/* Event Name & Tagline */}
            <h3 className="text-xl font-display font-bold mb-2 group-hover:text-primary transition-colors">
              {event.name}
            </h3>
            {event.tagline && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {event.tagline}
              </p>
            )}

            {/* Event Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.is_virtual ? 'Virtual Event' : event.location || 'TBA'}</span>
              </div>
              {event.max_participants && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Up to {event.max_participants} participants</span>
                </div>
              )}
            </div>

            {/* Registration Deadline */}
            {!isPast(registrationDeadline) && event.is_registration_open && (
              <div className="flex items-center gap-2 text-sm text-warning mb-4">
                <Clock className="h-4 w-4" />
                <span>Registration closes {formatDistanceToNow(registrationDeadline, { addSuffix: true })}</span>
              </div>
            )}

            {/* CTA */}
            <Button
              variant={status.label === 'Open for Registration' ? 'gradient' : 'outline'}
              className="w-full group/btn"
            >
              {status.label === 'Open for Registration' ? 'Register Now' : 'View Details'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Card.Content>
        </Card>
      </Link>
    </motion.div>
  );
}

function EventCardSkeleton() {
  return (
    <Card variant="glass" className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <Card.Content className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-10 w-full" />
      </Card.Content>
    </Card>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'live'>('all');

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .eq('is_published', true)
          .order('start_date', { ascending: false });

        if (error) throw error;
        setEvents(data as Event[]);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Filter events
  const filteredEvents = events.filter((event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      if (
        !event.name.toLowerCase().includes(search) &&
        !event.tagline?.toLowerCase().includes(search) &&
        !event.location?.toLowerCase().includes(search)
      ) {
        return false;
      }
    }

    // Status filter
    switch (filter) {
      case 'upcoming':
        return isFuture(startDate);
      case 'past':
        return isPast(endDate);
      case 'live':
        return now >= startDate && now <= endDate;
      default:
        return true;
    }
  });

  return (
    <PageLayout>
      {/* Hero Section */}
      <Section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="primary" className="mb-4">
              <Trophy className="mr-1 h-3 w-3" />
              Discover Events
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Upcoming <span className="text-gradient">Hackathons</span> & Events
            </h1>
            <p className="text-muted-foreground text-lg">
              Join the most exciting coding competitions and tech events. 
              Build, learn, and connect with developers from around the world.
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Search & Filter */}
      <Section className="py-8 border-y border-white/10">
        <Container>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events by name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'upcoming', 'live', 'past'] as const).map((filterOption) => (
                <Button
                  key={filterOption}
                  variant={filter === filterOption ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(filterOption)}
                >
                  {filterOption === 'all' && 'All'}
                  {filterOption === 'upcoming' && 'Upcoming'}
                  {filterOption === 'live' && '🔴 Live'}
                  {filterOption === 'past' && 'Past'}
                </Button>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Events Grid */}
      <Section className="py-16">
        <Container>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-charcoal flex items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for upcoming events!'}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              )}
            </motion.div>
          )}
        </Container>
      </Section>
    </PageLayout>
  );
}
