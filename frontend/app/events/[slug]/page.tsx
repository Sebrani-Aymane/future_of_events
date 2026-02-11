import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import EventDetailClient from './event-detail-client';
import type { Event, Sponsor } from '@/types';
import type { Database } from '@/types/database';

type EventRegistrationRow = Database['public']['Tables']['event_registrations']['Row'];
type TeamRow = Database['public']['Tables']['teams']['Row'];

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('events')
    .select('name, tagline, description, cover_image_url')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) {
    return { title: 'Event Not Found' };
  }

  const event = data;

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
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  // Fetch event stats
  const [registrationsCount, teamsCount, projectsCount] = await Promise.all([
    supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id),
    supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id),
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .in('status', ['submitted', 'under_review', 'finalist', 'winner']),
  ]);

  // Fetch sponsors
  const { data: sponsorsData } = await supabase
    .from('sponsors')
    .select('*')
    .eq('event_id', event.id)
    .eq('show_on_homepage', true)
    .order('display_order', { ascending: true });

  const sponsors = (sponsorsData || []) as Sponsor[];

  // Check if current user is registered
  const { data: { user } } = await supabase.auth.getUser();
  let isRegistered = false;
  let userRegistration: EventRegistrationRow | null = null;
  let userTeam: TeamRow | null = null;

  if (user) {
    const { data: registrationData, error: registrationError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!registrationError && registrationData) {
      isRegistered = true;
      userRegistration = registrationData;

      if (registrationData.team_id) {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', registrationData.team_id)
          .maybeSingle();

        if (!teamError && teamData) {
          userTeam = teamData;
        }
      }
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
