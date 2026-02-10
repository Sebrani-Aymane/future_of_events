import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AnnouncementsClient from './announcements-client';

export default async function AnnouncementsPage({
  params,
}: {
  params: { eventSlug: string };
}) {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = profileData as any;
  if (!profile) {
    redirect('/register');
  }

  // Get event by slug
  const { data: eventData } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.eventSlug)
    .single();

  const event = eventData as any;
  if (!event) {
    redirect('/events');
  }

  // Check if user is registered for this event
  const { data: registrationData } = await supabase
    .from('event_registrations')
    .select('*, team:teams(*)')
    .eq('event_id', event.id as string)
    .eq('user_id', user.id)
    .single();

  const registration = registrationData as any;
  if (!registration) {
    redirect(`/events/${params.eventSlug}`);
  }

  // Get announcements for this event
  const { data: announcementsData } = await supabase
    .from('announcements')
    .select(`
      *,
      author:profiles!announcements_author_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('event_id', event.id as string)
    .order('created_at', { ascending: false });

  const announcements = (announcementsData || []) as any[];

  return (
    <AnnouncementsClient
      eventSlug={params.eventSlug}
      event={event}
      user={{
        id: user.id,
        name: profile.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: profile.avatar_url,
        role: registration.role || 'participant',
      }}
      teamName={registration.team?.name}
      announcements={announcements}
    />
  );
}
