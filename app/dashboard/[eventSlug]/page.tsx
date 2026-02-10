import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import DashboardClient from './dashboard-client';

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
    .select('*, team:teams(*)')
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
  let project = null;

  if (registration?.team_id) {
    const { data: teamData } = await supabase
      .from('teams')
      .select(`
        *,
        leader:profiles!teams_leader_id_fkey(id, full_name, avatar_url, email),
        members:team_members(
          *,
          profile:profiles(id, full_name, avatar_url, email, skill_level, skills)
        )
      `)
      .eq('id', registration.team_id as string)
      .single();

    if (teamData) {
      team = teamData as any;
      teamMembers = (teamData as any).members || [];
    }

    // Get team's project
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('team_id', registration.team_id as string)
      .eq('event_id', event.id as string)
      .single();

    project = projectData as any;
  }

  // Get announcements
  const { data: announcementsData } = await supabase
    .from('announcements')
    .select('*')
    .eq('event_id', event.id as string)
    .eq('is_published', true)
    .or(`audience.eq.all,audience.eq.participants`)
    .order('created_at', { ascending: false })
    .limit(5);

  const announcements = (announcementsData || []) as any[];

  // Get event stats for leaderboard preview
  const { data: topProjectsData } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      average_score,
      team:teams(id, name)
    `)
    .eq('event_id', event.id as string)
    .in('status', ['submitted', 'under_review', 'finalist', 'winner'])
    .not('average_score', 'is', null)
    .order('average_score', { ascending: false })
    .limit(5);

  const topProjects = (topProjectsData || []) as any[];

  // Get activity feed
  const { data: activitiesData } = await supabase
    .from('activity_feed')
    .select('*')
    .eq('event_id', event.id as string)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10);

  const activities = (activitiesData || []) as any[];

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
      announcements={announcements}
      topProjects={topProjects}
      activities={activities}
    />
  );
}
