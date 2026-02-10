import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import TeamClient from './team-client';

export default async function TeamPage({
  params,
}: {
  params: { eventSlug: string };
}) {
  const supabase = await createSupabaseServerClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect(`/login?redirect=/dashboard/${params.eventSlug}/team`);
  }

  // Get user profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = profileData as any;
  if (!profile) {
    redirect('/login');
  }

  // Get event
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.eventSlug)
    .eq('is_active', true)
    .single();

  const event = eventData as any;
  if (eventError || !event) {
    notFound();
  }

  // Check if user is registered for this event
  const { data: registrationData } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', event.id as string)
    .eq('user_id', user.id)
    .single();

  const registration = registrationData as any;
  if (!registration) {
    redirect(`/events/${params.eventSlug}?message=not_registered`);
  }

  // Get user's team if they have one
  let team = null;
  let teamMembers: any[] = [];

  if (registration?.team_id) {
    const { data: teamData } = await supabase
      .from('teams')
      .select(`
        *,
        leader:profiles!teams_leader_id_fkey(id, full_name, avatar_url, email, skills, skill_level),
        members:team_members(
          *,
          profile:profiles(id, full_name, avatar_url, email, skill_level, skills, github_username, linkedin_url)
        )
      `)
      .eq('id', registration.team_id as string)
      .single();

    if (teamData) {
      team = teamData as any;
      teamMembers = (teamData as any).members || [];
    }
  }

  // Get open teams for browsing
  const { data: openTeamsData } = await supabase
    .from('teams')
    .select(`
      *,
      leader:profiles!teams_leader_id_fkey(id, full_name, avatar_url),
      members:team_members(id, user_id)
    `)
    .eq('event_id', event.id as string)
    .eq('is_open', true)
    .order('created_at', { ascending: false });

  const openTeams = (openTeamsData || []) as any[];
  
  // Filter out full teams
  const availableTeams = openTeams.filter((t: any) => 
    (t.members?.length || 0) < (t.max_members || event.max_team_size)
  );

  return (
    <TeamClient
      eventSlug={params.eventSlug}
      event={event}
      user={{
        id: user.id,
        name: profile.full_name,
        email: profile.email,
        avatar: profile.avatar_url,
        role: profile.role as 'participant' | 'admin' | 'judge',
      }}
      registration={registration}
      team={team}
      teamMembers={teamMembers}
      openTeams={availableTeams}
      isLeader={team?.leader_id === user.id}
    />
  );
}
