import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdminDashboardClient from './admin-dashboard-client';
import type { Database } from '@/types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type EventRow = Database['public']['Tables']['events']['Row'];
type EventRegistrationRow = Database['public']['Tables']['event_registrations']['Row'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ScoreRow = Database['public']['Tables']['scores']['Row'];

type RecentRegistration = EventRegistrationRow & {
  user: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url' | 'email'> | null;
};

type RecentProject = Pick<ProjectRow, 'id' | 'title' | 'status' | 'submitted_at'> & {
  team: { name: string } | null;
};

export default async function AdminDashboardPage({
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

  // Check if user is an admin for this event
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

  // Also check if user is a site admin
  const isSiteAdmin = profile.role === 'admin';

  if (!adminRegistration && !isSiteAdmin) {
    redirect(`/events/${params.eventSlug}`);
  }

  // Get event statistics
  const [
    participantsResult,
    teamsResult,
    projectsResult,
    submittedResult,
    judgesResult,
  ] = await Promise.all([
    supabase.from('event_registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('role', 'participant'),
    supabase.from('teams').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'submitted'),
    supabase.from('event_registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('role', 'judge'),
  ]);

  if (
    participantsResult.error ||
    teamsResult.error ||
    projectsResult.error ||
    submittedResult.error ||
    judgesResult.error
  ) {
    redirect(`/events/${params.eventSlug}`);
  }

  // Get recent registrations
  const { data: recentRegistrationsData, error: recentRegistrationsError } = await supabase
    .from('event_registrations')
    .select('id, user_id, status, role, registered_at')
    .eq('event_id', event.id)
    .order('registered_at', { ascending: false })
    .limit(5);

  if (recentRegistrationsError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const recentRegistrations = recentRegistrationsData ?? [];
  const recentUserIds = recentRegistrations.map((registration) => registration.user_id);
  const { data: recentUsers, error: recentUsersError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, email')
    .in('id', recentUserIds);

  if (recentUsersError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const recentUsersById = new Map((recentUsers ?? []).map((userRow) => [userRow.id, userRow]));
  const recentRegistrationsWithUser: RecentRegistration[] = recentRegistrations.map((registration) => ({
    ...registration,
    user: recentUsersById.get(registration.user_id) ?? null,
  }));

  // Get recent projects
  const { data: recentProjectsData, error: recentProjectsError } = await supabase
    .from('projects')
    .select('id, title, status, submitted_at, team_id')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentProjectsError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const recentProjects = recentProjectsData ?? [];
  const recentTeamIds = recentProjects
    .map((project) => project.team_id)
    .filter((teamId): teamId is string => !!teamId);
  const { data: recentTeams, error: recentTeamsError } = await supabase
    .from('teams')
    .select('id, name')
    .in('id', recentTeamIds);

  if (recentTeamsError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const teamsById = new Map((recentTeams ?? []).map((team) => [team.id, team]));
  const recentProjectsWithTeam: RecentProject[] = recentProjects.map((project) => ({
    id: project.id,
    title: project.title,
    status: project.status,
    submitted_at: project.submitted_at,
    team: project.team_id ? teamsById.get(project.team_id) ?? null : null,
  }));

  // Get judging progress
  const { data: scoresData, error: scoresError } = await supabase
    .from('scores')
    .select('project_id, judge_id')
    .eq('event_id', event.id);

  if (scoresError) {
    redirect(`/events/${params.eventSlug}`);
  }

  const scores: Pick<ScoreRow, 'project_id' | 'judge_id'>[] = scoresData ?? [];
  const uniqueProjectsJudged = new Set(scores.map(s => s.project_id)).size;

  // Extract counts from results
  const participantCount = participantsResult.count;
  const teamCount = teamsResult.count;
  const projectCount = projectsResult.count;
  const submittedCount = submittedResult.count;
  const judgeCount = judgesResult.count;

  // Get pending items
  const { count: pendingRegistrations, error: pendingError } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('status', 'pending');

  if (pendingError) {
    redirect(`/events/${params.eventSlug}`);
  }

  return (
    <AdminDashboardClient
      eventSlug={params.eventSlug}
      event={event}
      admin={{
        id: user.id,
        name: profile.full_name || user.email?.split('@')[0] || 'Admin',
        email: user.email || '',
        avatar: profile.avatar_url,
      }}
      stats={{
        participants: participantCount || 0,
        teams: teamCount || 0,
        projects: projectCount || 0,
        submitted: submittedCount || 0,
        judges: judgeCount || 0,
        projectsJudged: uniqueProjectsJudged,
      }}
      recentRegistrations={recentRegistrationsWithUser}
      recentProjects={recentProjectsWithTeam}
      pendingRegistrations={pendingRegistrations || 0}
    />
  );
}
