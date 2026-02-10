import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import EventDetailClient from './event-detail-client';
import type { Event, Sponsor } from '@/types';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('events')
    .select('name, tagline, description, cover_image_url')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .eq('is_published', true)
    .single();

  const event = data as any;
  if (!event) {
    return { title: 'Event Not Found' };
  }

  return {
    title: event.name,
    description: event.tagline || event.description?.slice(0, 160),
    openGraph: {
      title: event.name,
      description: event.tagline || event.description?.slice(0, 160) || '',
      images: event.cover_image_url ? [event.cover_image_url] : [],
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const supabase = await createServerSupabaseClient();
  
  // Fetch event data
  const { data: eventData, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .eq('is_published', true)
    .single();

  const event = eventData as any;
  if (error || !event) {
    notFound();
  }

  // Fetch event stats
  const [registrationsCount, teamsCount, projectsCount] = await Promise.all([
    supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id as string),
    supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id as string),
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id as string)
      .in('status', ['submitted', 'under_review', 'finalist', 'winner']),
  ]);

  // Fetch sponsors
  const { data: sponsorsData } = await supabase
    .from('sponsors')
    .select('*')
    .eq('event_id', event.id as string)
    .eq('show_on_homepage', true)
    .order('display_order', { ascending: true });

  const sponsors = (sponsorsData || []) as Sponsor[];

  // Check if current user is registered
  const { data: { user } } = await supabase.auth.getUser();
  let isRegistered = false;
  let userRegistration = null;
  let userTeam = null;

  if (user) {
    const { data: registrationData } = await supabase
      .from('event_registrations')
      .select('*, team:teams(*)')
      .eq('event_id', event.id as string)
      .eq('user_id', user.id)
      .single();

    const registration = registrationData as any;
    if (registration) {
      isRegistered = true;
      userRegistration = registration;
      userTeam = registration.team;
    }
  }

  const eventWithStats = {
    ...event,
    _count: {
      registrations: registrationsCount.count ?? 0,
      teams: teamsCount.count ?? 0,
      projects: projectsCount.count ?? 0,
    },
  };

  return (
    <EventDetailClient
      event={eventWithStats as Event & { _count: { registrations: number; teams: number; projects: number } }}
      sponsors={sponsors}
      isRegistered={isRegistered}
      userRegistration={userRegistration}
      userTeam={userTeam}
      isAuthenticated={!!user}
    />
  );
}
