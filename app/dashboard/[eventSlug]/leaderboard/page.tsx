import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import LeaderboardClient from './leaderboard-client';

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

  // Check if user is registered for this event
  const { data: registrationData } = await supabase
    .from('event_registrations')
    .select('*, team:teams(*)')
    .eq('event_id', event.id as string)
    .eq('user_id', user.id)
    .single();

  const registration = registrationData as any;
  if (!registration) {
    redirect(`/events/${params.eventSlug}`);
  }

  // Get leaderboard data - projects with their scores
  // This shows all submitted projects with their average scores (if judging is complete)
  const { data: projectsData } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      tagline,
      status,
      submitted_at,
      team:teams(
        id,
        name,
        avatar_url
      )
    `)
    .eq('event_id', event.id as string)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true });

  const projects = (projectsData || []) as any[];

  // Get scores for each project
  const projectsWithScores = await Promise.all(
    projects.map(async (project: any) => {
      const { data: scoresData } = await supabase
        .from('scores')
        .select('total_score')
        .eq('project_id', project.id as string);

      const scores = (scoresData || []) as any[];
      const totalScores = scores.map((s: any) => s.total_score);
      const averageScore = totalScores.length > 0
        ? totalScores.reduce((a: number, b: number) => a + b, 0) / totalScores.length
        : null;

      return {
        ...project,
        averageScore,
        judgeCount: totalScores.length,
      };
    })
  );

  // Sort by average score (highest first), then by submission time
  const sortedProjects = projectsWithScores.sort((a: any, b: any) => {
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
      teamName={registration.team?.name}
      userTeamId={registration.team?.id}
      projects={sortedProjects}
      isJudgingComplete={event.is_judging_complete || false}
    />
  );
}
