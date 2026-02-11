import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ParticipantsClient from './participants-client';
import type { Database } from '@/types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type EventRow = Database['public']['Tables']['events']['Row'];
type EventRegistrationRow = Database['public']['Tables']['event_registrations']['Row'];
type TeamRow = Database['public']['Tables']['teams']['Row'];

type RegistrationWithRelations = EventRegistrationRow & {
  user: Pick<ProfileRow, 'id' | 'full_name' | 'email' | 'avatar_url' | 'bio' | 'github_username' | 'linkedin_url' | 'skills'> | null;
  team: Pick<TeamRow, 'id' | 'name'> | null;
};

export default async function ParticipantsPage({
  params,
  searchParams,
}: {
  params: { eventSlug: string };
  searchParams: { status?: string; role?: string; search?: string };
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

  // Check if user is an admin
  const { data: adminRegistration, error: adminRegistrationError } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', event.id)
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (adminRegistrationError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const isSiteAdmin = profile.role === 'admin';

  if (!adminRegistration && !isSiteAdmin) {
    redirect(`/events/${params.eventSlug}`);
  }

  // Build query for registrations
  let query = supabase
    .from('event_registrations')
    .select('id, event_id, user_id, status, role, registered_at, team_id')
    .eq('event_id', event.id)
    .order('registered_at', { ascending: false });

  // Apply filters
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }
  if (searchParams.role && searchParams.role !== 'all') {
    query = query.eq('role', searchParams.role);
  }

  const { data: registrationsData, error: registrationsError } = await query;

  if (registrationsError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const registrationsBase = registrationsData ?? [];
  const userIds = registrationsBase.map((registration) => registration.user_id);
  const teamIds = registrationsBase
    .map((registration) => registration.team_id)
    .filter((teamId): teamId is string => !!teamId);

  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, bio, github_username, linkedin_url, skills')
    .in('id', userIds);

  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('id, name')
    .in('id', teamIds);

  if (userError || teamError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const usersById = new Map((userData ?? []).map((row) => [row.id, row]));
  const teamsById = new Map((teamData ?? []).map((row) => [row.id, row]));
  const registrations: RegistrationWithRelations[] = registrationsBase.map((registration) => ({
    ...registration,
    user: usersById.get(registration.user_id) ?? null,
    team: registration.team_id ? teamsById.get(registration.team_id) ?? null : null,
  }));

  // Get counts by status
  const { count: totalCount, error: totalCountError } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id);

  const { count: pendingCount, error: pendingCountError } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('status', 'pending');

  const { count: approvedCount, error: approvedCountError } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('status', 'approved');

  if (totalCountError || pendingCountError || approvedCountError) {
    redirect(`/events/${params.eventSlug}`);
  }

  return (
    <ParticipantsClient
      eventSlug={params.eventSlug}
      event={event}
      admin={{
        id: user.id,
        name: profile.full_name || user.email?.split('@')[0] || 'Admin',
        email: user.email || '',
        avatar: profile.avatar_url,
      }}
      registrations={registrations}
      counts={{
        total: totalCount || 0,
        pending: pendingCount || 0,
        approved: approvedCount || 0,
      }}
      filters={{
        status: searchParams.status || 'all',
        role: searchParams.role || 'all',
        search: searchParams.search || '',
      }}
    />
  );
}
