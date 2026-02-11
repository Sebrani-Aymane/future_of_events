import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import TeamClient from './team-client';
import type { Database } from '@/types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type EventRow = Database['public']['Tables']['events']['Row'];
type EventRegistrationRow = Database['public']['Tables']['event_registrations']['Row'];
type TeamRow = Database['public']['Tables']['teams']['Row'];
type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];

type TeamMemberWithProfile = TeamMemberRow & { profile: ProfileRow };
type OpenTeam = TeamRow & { members: Array<Pick<TeamMemberRow, 'id' | 'user_id'>> };

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
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    redirect('/login');
  }

  // Get event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.eventSlug)
    .eq('is_active', true)
    .maybeSingle();

  if (eventError || !event) {
    notFound();
  }

  // Check if user is registered for this event
  const { data: registration, error: registrationError } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', event.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (registrationError || !registration) {
    redirect(`/events/${params.eventSlug}?message=not_registered`);
  }

  // Get user's team if they have one
  let team: TeamRow | null = null;
  let teamMembers: TeamMemberWithProfile[] = [];

  if (registration?.team_id) {
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', registration.team_id)
      .maybeSingle();

    if (teamError) {
      redirect(`/events/${params.eventSlug}?message=not_registered`);
    }

    if (teamData) {
      team = teamData;
      const { data: teamMemberRows, error: teamMembersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamData.id);

      if (teamMembersError) {
        redirect(`/events/${params.eventSlug}?message=not_registered`);
      }

      const memberUserIds = (teamMemberRows ?? []).map((member) => member.user_id);
      const { data: memberProfiles, error: memberProfilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email, skill_level, skills, github_username, linkedin_url')
        .in('id', memberUserIds);

      if (memberProfilesError) {
        redirect(`/events/${params.eventSlug}?message=not_registered`);
      }

      const profilesById = new Map((memberProfiles ?? []).map((profileRow) => [profileRow.id, profileRow]));
      teamMembers = (teamMemberRows ?? []).flatMap((member) => {
        const profileRow = profilesById.get(member.user_id);
        return profileRow ? [{ ...member, profile: profileRow }] : [];
      });
    }
  }

  // Get open teams for browsing
  const { data: openTeamsData, error: openTeamsError } = await supabase
    .from('teams')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_open', true)
    .order('created_at', { ascending: false });

  if (openTeamsError) {
    redirect(`/events/${params.eventSlug}?message=not_registered`);
  }

  const openTeams = openTeamsData ?? [];
  const openTeamIds = openTeams.map((teamRow) => teamRow.id);
  const { data: openTeamMembers, error: openTeamMembersError } = await supabase
    .from('team_members')
    .select('id, user_id, team_id')
    .in('team_id', openTeamIds);

  if (openTeamMembersError) {
    redirect(`/events/${params.eventSlug}?message=not_registered`);
  }

  const openMembersByTeamId = new Map<string, Array<Pick<TeamMemberRow, 'id' | 'user_id'>>>();
  (openTeamMembers ?? []).forEach((member) => {
    const list = openMembersByTeamId.get(member.team_id) ?? [];
    list.push({ id: member.id, user_id: member.user_id });
    openMembersByTeamId.set(member.team_id, list);
  });

  const openTeamsWithMembers: OpenTeam[] = openTeams.map((teamRow) => ({
    ...teamRow,
    members: openMembersByTeamId.get(teamRow.id) ?? [],
  }));
  
  // Filter out full teams
  const availableTeams = openTeamsWithMembers.filter((teamRow) => 
    (teamRow.members.length || 0) < (teamRow.max_members || event.max_team_size)
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
