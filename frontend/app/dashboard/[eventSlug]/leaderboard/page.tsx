import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import LeaderboardClient from './leaderboard-client';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type EventRegistration = Database['public']['Tables']['event_registrations']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];

type ProjectWithTeam = Pick<Project, 'id' | 'title' | 'tagline' | 'status' | 'submitted_at'> & {
  team: Pick<Team, 'id' | 'name' | 'avatar_url'> | null;
};

type ProjectWithScore = ProjectWithTeam & {
  averageScore: number | null;
  judgeCount: number;
};

export default async function LeaderboardPage({
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
  let userTeam: Pick<Team, 'id' | 'name'> | null = null;
  if (registration.team_id) {
    const { data: teamData } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', registration.team_id)
      .maybeSingle();
    userTeam = teamData || null;
  }

  // Get leaderboard data - projects with their scores
  const { data: projectsBase } = await supabase
    .from('projects')
    .select('id, title, tagline, status, submitted_at, team_id')
    .eq('event_id', event.id)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true });

  const projects = projectsBase || [];

  // Get team info for projects
  const teamIds = projects.map(p => p.team_id);
  const { data: teamsData } = await supabase
    .from('teams')
    .select('id, name, avatar_url')
    .in('id', teamIds);

  const teamMap = new Map(teamsData?.map(t => [t.id, t]));

  const projectsWithTeam: ProjectWithTeam[] = projects.map(project => ({
    id: project.id,
    title: project.title,
    tagline: project.tagline,
    status: project.status,
    submitted_at: project.submitted_at,
    team: teamMap.get(project.team_id) || null,
  }));

  // Get scores for each project
  const projectsWithScores: ProjectWithScore[] = await Promise.all(
    projectsWithTeam.map(async (project) => {
      const { data: scoresData } = await supabase
        .from('scores')
        .select('total_score')
        .eq('project_id', project.id);

      const scores = scoresData || [];
      const totalScores = scores.map(s => s.total_score);
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

  // Sort by average score (highest first), then by submission time
  const sortedProjects = projectsWithScores.sort((a, b) => {
    if (a.averageScore === null && b.averageScore === null) {
      return new Date(a.submitted_at || 0).getTime() - new Date(b.submitted_at || 0).getTime();
    }
    if (a.averageScore === null) return 1;
    if (b.averageScore === null) return -1;
    return b.averageScore - a.averageScore;
  });

  return (
    <LeaderboardClient
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
      userTeamId={userTeam?.id}
      projects={sortedProjects}
      isJudgingComplete={event.is_results_published || false}
    />
  );
}
