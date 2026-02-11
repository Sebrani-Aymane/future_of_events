import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProjectsClient from './projects-client';
import type { Database } from '@/types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type EventRow = Database['public']['Tables']['events']['Row'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];
type TeamRow = Database['public']['Tables']['teams']['Row'];
type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];
type ScoreRow = Database['public']['Tables']['scores']['Row'];

type ProjectWithTeam = Pick<
  ProjectRow,
  | 'id'
  | 'title'
  | 'tagline'
  | 'description'
  | 'status'
  | 'github_url'
  | 'demo_url'
  | 'video_url'
  | 'tech_stack'
  | 'submitted_at'
  | 'created_at'
  | 'team_id'
> & {
  team: {
    id: string;
    name: string;
    avatar_url: string | null;
    members: Array<{ user: Pick<ProfileRow, 'id' | 'full_name'> }>;
  } | null;
};

export default async function AdminProjectsPage({
  params,
  searchParams,
}: {
  params: { eventSlug: string };
  searchParams: { status?: string };
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

  // Build query for projects
  let query = supabase
    .from('projects')
    .select('id, title, tagline, description, status, github_url, demo_url, video_url, tech_stack, submitted_at, created_at, team_id')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false });

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }

  const { data: projectsData, error: projectsError } = await query;

  if (projectsError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const projectsBase = projectsData ?? [];
  const teamIds = projectsBase
    .map((project) => project.team_id)
    .filter((teamId): teamId is string => !!teamId);
  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, avatar_url')
    .in('id', teamIds);

  const { data: teamMembersData, error: teamMembersError } = await supabase
    .from('team_members')
    .select('team_id, user_id')
    .in('team_id', teamIds);

  const memberIds = (teamMembersData ?? []).map((member) => member.user_id);
  const { data: memberProfilesData, error: memberProfilesError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', memberIds);

  if (teamsError || teamMembersError || memberProfilesError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const teamsById = new Map((teamsData ?? []).map((team) => [team.id, team]));
  const profilesById = new Map((memberProfilesData ?? []).map((profileRow) => [profileRow.id, profileRow]));
  const membersByTeamId = new Map<string, Array<{ user: Pick<ProfileRow, 'id' | 'full_name'> }>>();

  (teamMembersData ?? []).forEach((member) => {
    const profileRow = profilesById.get(member.user_id);
    if (!profileRow) return;
    const list = membersByTeamId.get(member.team_id) ?? [];
    list.push({ user: profileRow });
    membersByTeamId.set(member.team_id, list);
  });

  const projects: ProjectWithTeam[] = projectsBase.map((project) => {
    const team = project.team_id ? teamsById.get(project.team_id) ?? null : null;
    return {
      ...project,
      team: team
        ? {
            id: team.id,
            name: team.name,
            avatar_url: team.avatar_url,
            members: project.team_id ? membersByTeamId.get(project.team_id) ?? [] : [],
          }
        : null,
    };
  });

  // Get scores for each project
  const projectsWithScores = await Promise.all(
    projects.map(async (project) => {
      const { data: scoresData, error: scoresError } = await supabase
        .from('scores')
        .select('total_score, judge_id')
        .eq('project_id', project.id);

      if (scoresError) {
        return {
          ...project,
          averageScore: null,
          judgeCount: 0,
        };
      }

      const scores: Pick<ScoreRow, 'total_score'>[] = scoresData ?? [];
      const totalScores = scores.map((score) => score.total_score ?? 0);
      const averageScore = totalScores.length > 0
        ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length
        : null;

      return {
        ...project,
        averageScore,
        judgeCount: totalScores.length,
      };
    })
  );

  // Get counts
  const { count: totalCount, error: totalCountError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id);

  const { count: draftCount, error: draftCountError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('status', 'draft');

  const { count: submittedCount, error: submittedCountError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('status', 'submitted');

  if (totalCountError || draftCountError || submittedCountError) {
    redirect(`/events/${params.eventSlug}`);
  }

  return (
    <ProjectsClient
      eventSlug={params.eventSlug}
      event={event}
      admin={{
        id: user.id,
        name: profile.full_name || user.email?.split('@')[0] || 'Admin',
        email: user.email || '',
        avatar: profile.avatar_url,
      }}
      projects={projectsWithScores}
      counts={{
        total: totalCount || 0,
        draft: draftCount || 0,
        submitted: submittedCount || 0,
      }}
      currentFilter={searchParams.status || 'all'}
    />
  );
}
