import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AnnouncementsClient from './announcements-client';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type EventRegistration = Database['public']['Tables']['event_registrations']['Row'];
type Announcement = Database['public']['Tables']['announcements']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];

type AnnouncementWithAuthor = Announcement & {
  author: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
};

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
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    redirect('/register');
  }

  // Get event by slug
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.eventSlug)
    .maybeSingle();

  if (eventError || !event) {
    redirect('/events');
  }

  // Check if user is registered for this event
  const { data: registration, error: registrationError } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', event.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (registrationError || !registration) {
    redirect(`/events/${params.eventSlug}`);
  }

  // Get user's team if they have one
  let userTeam: Pick<Team, 'name'> | null = null;
  if (registration.team_id) {
    const { data: teamData } = await supabase
      .from('teams')
      .select('name')
      .eq('id', registration.team_id)
      .maybeSingle();
    userTeam = teamData || null;
  }

  // Get announcements for this event
  const { data: announcementsBase } = await supabase
    .from('announcements')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false });

  const announcementsData = announcementsBase || [];

  // Get author info for announcements
  const authorIds = announcementsData.map(a => a.author_id).filter(Boolean);
  const { data: authorsData } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', authorIds);

  const authorMap = new Map(authorsData?.map(a => [a.id, a]));

  const announcements: AnnouncementWithAuthor[] = announcementsData.map(announcement => ({
    ...announcement,
    author: announcement.author_id ? authorMap.get(announcement.author_id) || null : null,
  }));

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
      teamName={userTeam?.name}
      announcements={announcements}
    />
  );
}
