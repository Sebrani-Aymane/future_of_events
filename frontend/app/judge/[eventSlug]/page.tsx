import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import JudgePortalClient from './judge-portal-client';
import type { Database } from '@/types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type EventRow = Database['public']['Tables']['events']['Row'];
type EventRegistrationRow = Database['public']['Tables']['event_registrations']['Row'];
type ScoringCriterionRow = Database['public']['Tables']['scoring_criteria']['Row'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];
type TeamRow = Database['public']['Tables']['teams']['Row'];
type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];
type ScoreRow = Database['public']['Tables']['scores']['Row'];
type ScoreDetailRow = Database['public']['Tables']['score_details']['Row'];

type ProjectWithTeam = ProjectRow & {
  team: {
    id: string;
    name: string;
    avatar_url: string | null;
    members: Array<{
      id: string;
      role: string | null;
      user: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'>;
    }>;
  } | null;
};

type ScoreWithDetails = ScoreRow & { criteria_scores: ScoreDetailRow[] };

export default async function JudgePortalPage({
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

  // Check if user is a judge for this event
  const { data: judgeRegistration, error: judgeRegistrationError } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', event.id)
    .eq('user_id', user.id)
    .eq('role', 'judge')
    .maybeSingle();

  if (judgeRegistrationError) {
    redirect(`/events/${params.eventSlug}`);
  }

  if (!judgeRegistration) {
    // User is not a judge for this event
    redirect(`/events/${params.eventSlug}`);
  }

  // Get scoring criteria for this event
  const { data: criteria, error: criteriaError } = await supabase
    .from('scoring_criteria')
    .select('*')
    .eq('event_id', event.id)
    .order('order', { ascending: true });

  if (criteriaError) {
    redirect(`/events/${params.eventSlug}`);
  }

  // Get all submitted projects for this event
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('event_id', event.id)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true });

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

  if (teamsError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const { data: teamMembersData, error: teamMembersError } = await supabase
    .from('team_members')
    .select('id, role, team_id, user_id')
    .in('team_id', teamIds);

  if (teamMembersError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const memberUserIds = (teamMembersData ?? []).map((member) => member.user_id);
  const { data: memberProfiles, error: memberProfilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', memberUserIds);

  if (memberProfilesError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const profilesById = new Map((memberProfiles ?? []).map((profileRow) => [profileRow.id, profileRow]));
  const membersByTeamId = new Map<string, Array<{ id: string; role: string | null; user: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'> }>>();

  (teamMembersData ?? []).forEach((member) => {
    const userProfile = profilesById.get(member.user_id);
    if (!userProfile) return;
    const list = membersByTeamId.get(member.team_id) ?? [];
    list.push({ id: member.id, role: member.role, user: userProfile });
    membersByTeamId.set(member.team_id, list);
  });

  const teamsById = new Map((teamsData ?? []).map((team) => [team.id, team]));
  const projects: ProjectWithTeam[] = projectsBase.map((project) => {
    const team = project.team_id ? teamsById.get(project.team_id) ?? null : null;
    const members = project.team_id ? membersByTeamId.get(project.team_id) ?? [] : [];
    return {
      ...project,
      team: team
        ? {
            id: team.id,
            name: team.name,
            avatar_url: team.avatar_url,
            members,
          }
        : null,
    };
  });

  // Get existing scores by this judge
  const { data: existingScoresData, error: existingScoresError } = await supabase
    .from('scores')
    .select('*')
    .eq('judge_id', user.id)
    .in('project_id', projects.map(p => p.id));

  if (existingScoresError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const existingScores = existingScoresData ?? [];
  const scoreIds = existingScores.map((score) => score.id);
  const { data: scoreDetailsData, error: scoreDetailsError } = await supabase
    .from('score_details')
    .select('*')
    .in('score_id', scoreIds);

  if (scoreDetailsError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const scoreDetailsByScoreId = new Map<string, ScoreDetailRow[]>();
  (scoreDetailsData ?? []).forEach((detail) => {
    const list = scoreDetailsByScoreId.get(detail.score_id) ?? [];
    list.push(detail);
    scoreDetailsByScoreId.set(detail.score_id, list);
  });

  const scoresWithDetails: ScoreWithDetails[] = existingScores.map((score) => ({
    ...score,
    criteria_scores: scoreDetailsByScoreId.get(score.id) ?? [],
  }));

  // Create a map of scored project IDs
  const scoredProjectIds = new Set(existingScores.map(s => s.project_id));

  return (
    <JudgePortalClient
      eventSlug={params.eventSlug}
      event={event}
      judge={{
        id: user.id,
        name: profile.full_name || user.email?.split('@')[0] || 'Judge',
        email: user.email || '',
        avatar: profile.avatar_url,
        specialty: profile.bio || 'Judge',
      }}
      criteria={criteria ?? []}
      projects={projects}
      existingScores={scoresWithDetails}
      scoredProjectIds={Array.from(scoredProjectIds)}
    />
  );
}
