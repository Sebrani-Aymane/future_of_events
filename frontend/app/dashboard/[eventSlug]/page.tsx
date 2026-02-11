import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import DashboardClient from './dashboard-client';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type EventRegistration = Database['public']['Tables']['event_registrations']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];
type TeamMember = Database['public']['Tables']['team_members']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Announcement = Database['public']['Tables']['announcements']['Row'];
type ActivityFeed = Database['public']['Tables']['activity_feed']['Row'];

type TeamWithLeaderAndMembers = Team & {
  leader: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'email'>;
  members: Array<TeamMember & {
    profile: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'email' | 'skill_level' | 'skills'>;
  }>;
};

type ProjectWithTeam = Project & {
  team: Pick<Team, 'id' | 'name'> | null;
};

export default async function DashboardPage({
  params,
}: {
  params: { eventSlug: string };
}) {
  const supabase = await createSupabaseServerClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect(`/login?redirect=/dashboard/${params.eventSlug}`);
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
  let team: TeamWithLeaderAndMembers | null = null;
  let teamMembers: Array<TeamMember & {
    profile: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'email' | 'skill_level' | 'skills'>;
  }> = [];
  let project: Project | null = null;

  if (registration.team_id) {
    // Get team base data
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', registration.team_id)
      .maybeSingle();

    if (!teamError && teamData) {
      // Get leader info
      const { data: leaderData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .eq('id', teamData.leader_id)
        .maybeSingle();

      // Get team members
      const { data: membersData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamData.id);

      const members = membersData || [];

      // Get member profiles
      const memberUserIds = members.map(m => m.user_id);
      const { data: memberProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email, skill_level, skills')
        .in('id', memberUserIds);

      const profileMap = new Map(memberProfiles?.map(p => [p.id, p]));

      teamMembers = members.map(member => ({
        ...member,
        profile: profileMap.get(member.user_id) ?? { id: '', full_name: '', avatar_url: null, email: '', skill_level: null, skills: null },
      })).filter(m => m.profile.id);

      if (leaderData) {
        team = {
          ...teamData,
          leader: leaderData,
          members: teamMembers,
        };
      }
    }

    // Get team's project
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('team_id', registration.team_id)
      .eq('event_id', event.id)
      .maybeSingle();

    project = projectData || null;
  }

  // Get announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_published', true)
    .or(`audience.eq.all,audience.eq.participants`)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get event stats for leaderboard preview (base projects)
  const { data: topProjectsBase } = await supabase
    .from('projects')
    .select('id, title, average_score, team_id')
    .eq('event_id', event.id)
    .in('status', ['submitted', 'under_review', 'finalist', 'winner'])
    .not('average_score', 'is', null)
    .order('average_score', { ascending: false })
    .limit(5);

  // Get team names for top projects
  let topProjects: ProjectWithTeam[] = [];
  if (topProjectsBase && topProjectsBase.length > 0) {
    const teamIds = topProjectsBase.map(p => p.team_id);
    const { data: teamsData } = await supabase
      .from('teams')
      .select('id, name')
      .in('id', teamIds);

    const teamMap = new Map(teamsData?.map(t => [t.id, t]));

    topProjects = topProjectsBase.map(project => ({
      ...project,
      team: teamMap.get(project.team_id) || null,
    })) as ProjectWithTeam[];
  }

  // Get activity feed

  // Get activity feed
  const { data: activities } = await supabase
    .from('activity_feed')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <DashboardClient
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
      project={project}
      announcements={announcements || []}
      topProjects={topProjects}
      activities={activities || []}
    />
  );
}
