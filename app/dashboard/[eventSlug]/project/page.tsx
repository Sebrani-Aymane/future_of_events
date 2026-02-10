import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ProjectClient from './project-client';

export default async function ProjectPage({
  params,
}: {
  params: { eventSlug: string };
}) {
  const supabase = await createSupabaseServerClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect(`/login?redirect=/dashboard/${params.eventSlug}/project`);
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
    .select('*')
    .eq('event_id', event.id as string)
    .eq('user_id', user.id)
    .single();

  const registration = registrationData as any;
  if (!registration) {
    redirect(`/events/${params.eventSlug}?message=not_registered`);
  }

  // Get user's team
  let team = null;
  let project = null;
  let isTeamLeader = false;

  if (registration?.team_id) {
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('id', registration.team_id as string)
      .single();

    if (teamData) {
      team = teamData as any;
      isTeamLeader = (teamData as any).leader_id === user.id;
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

  return (
    <ProjectClient
      eventSlug={params.eventSlug}
      event={event}
      user={{
        id: user.id,
        name: profile.full_name,
        email: profile.email,
        avatar: profile.avatar_url,
        role: profile.role as 'participant' | 'admin' | 'judge',
      }}
      team={team}
      project={project}
      isTeamLeader={isTeamLeader}
    />
  );
}
