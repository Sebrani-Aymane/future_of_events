import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ParticipantsClient from './participants-client';

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

  // Check if user is an admin
  const { data: adminRegistration } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', event.id as string)
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();

  const isSiteAdmin = profile.role === 'admin';

  if (!adminRegistration && !isSiteAdmin) {
    redirect(`/events/${params.eventSlug}`);
  }

  // Build query for registrations
  let query = supabase
    .from('event_registrations')
    .select(`
      *,
      user:profiles(
        id,
        full_name,
        email,
        avatar_url,
        bio,
        github_url,
        linkedin_url,
        skills
      ),
      team:teams(
        id,
        name
      )
    `)
    .eq('event_id', event.id as string)
    .order('registered_at', { ascending: false });

  // Apply filters
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }
  if (searchParams.role && searchParams.role !== 'all') {
    query = query.eq('role', searchParams.role);
  }

  const { data: registrationsData } = await query;
  const registrations = (registrationsData || []) as any[];

  // Get counts by status
  const { count: totalCount } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id as string);

  const { count: pendingCount } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id as string)
    .eq('status', 'pending');

  const { count: approvedCount } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id as string)
    .eq('status', 'approved');

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
