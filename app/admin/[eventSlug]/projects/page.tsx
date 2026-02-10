import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProjectsClient from './projects-client';

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

  // Build query for projects
  let query = supabase
    .from('projects')
    .select(`
      *,
      team:teams(
        id,
        name,
        avatar_url,
        members:team_members(
          user:profiles(id, full_name)
        )
      )
    `)
    .eq('event_id', event.id as string)
    .order('created_at', { ascending: false });

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }

  const { data: projectsData } = await query;
  const projects = (projectsData || []) as any[];

  // Get scores for each project
  const projectsWithScores = await Promise.all(
    projects.map(async (project: any) => {
      const { data: scoresData } = await supabase
        .from('scores')
        .select('total_score, judge_id')
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

  // Get counts
  const { count: totalCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id as string);

  const { count: draftCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id as string)
    .eq('status', 'draft');

  const { count: submittedCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id as string)
    .eq('status', 'submitted');

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
