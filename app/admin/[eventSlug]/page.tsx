import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdminDashboardClient from './admin-dashboard-client';

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
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/register');
  }

  // Get event by slug
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.eventSlug)
    .single();

  if (!event) {
    redirect('/events');
  }

  // Check if user is an admin for this event
  const { data: adminRegistration } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', event.id)
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();

  // Also check if user is a site admin
  const isSiteAdmin = profile.role === 'admin';

  if (!adminRegistration && !isSiteAdmin) {
    redirect(\`/events/\${params.eventSlug}\`);
  }

  // Get event statistics
  const [
    { count: participantCount },
    { count: teamCount },
    { count: projectCount },
    { count: submittedCount },
    { count: judgeCount },
  ] = await Promise.all([
    supabase.from('event_registrations').select('*', { count: 'exact', head: true }).eq('event_id', event.id).eq('role', 'participant'),
    supabase.from('teams').select('*', { count: 'exact', head: true }).eq('event_id', event.id),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('event_id', event.id),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'submitted'),
    supabase.from('event_registrations').select('*', { count: 'exact', head: true }).eq('event_id', event.id).eq('role', 'judge'),
  ]);

  // Get recent registrations
  const { data: recentRegistrations } = await supabase
    .from('event_registrations')
    .select(\`
      *,
      user:profiles(id, full_name, avatar_url, email)
    \`)
    .eq('event_id', event.id)
    .order('registered_at', { ascending: false })
    .limit(5);

  // Get recent projects
  const { data: recentProjects } = await supabase
    .from('projects')
    .select(\`
      id,
      title,
      status,
      submitted_at,
      team:teams(name)
    \`)
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get judging progress
  const { data: scores } = await supabase
    .from('scores')
    .select('project_id, judge_id')
    .eq('event_id', event.id);

  const uniqueProjectsJudged = new Set(scores?.map(s => s.project_id) || []).size;

  // Get pending items
  const { count: pendingRegistrations } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('status', 'pending');

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
      recentRegistrations={recentRegistrations || []}
      recentProjects={recentProjects || []}
      pendingRegistrations={pendingRegistrations || 0}
    />
  );
}
