import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ProjectClient from './project-client';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type EventRegistration = Database['public']['Tables']['event_registrations']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

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

  // Get user's team
  let team: Team | null = null;
  let project: Project | null = null;
  let isTeamLeader = false;

  if (registration.team_id) {
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', registration.team_id)
      .maybeSingle();

    if (!teamError && teamData) {
      team = teamData;
      isTeamLeader = teamData.leader_id === user.id;
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
