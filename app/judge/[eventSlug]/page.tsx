import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import JudgePortalClient from './judge-portal-client';

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

  // Check if user is a judge for this event
  const { data: judgeRegistration } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', event.id)
    .eq('user_id', user.id)
    .eq('role', 'judge')
    .single();

  if (!judgeRegistration) {
    // User is not a judge for this event
    redirect(`/events/${params.eventSlug}`);
  }

  // Get scoring criteria for this event
  const { data: criteria } = await supabase
    .from('scoring_criteria')
    .select('*')
    .eq('event_id', event.id)
    .order('order', { ascending: true });

  // Get all submitted projects for this event
  const { data: projects } = await supabase
    .from('projects')
    .select(\`
      *,
      team:teams(
        id,
        name,
        avatar_url,
        members:team_members(
          id,
          role,
          user:profiles(
            id,
            full_name,
            avatar_url
          )
        )
      )
    \`)
    .eq('event_id', event.id)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true });

  // Get existing scores by this judge
  const { data: existingScores } = await supabase
    .from('scores')
    .select('*, criteria_scores:score_details(*)')
    .eq('judge_id', user.id)
    .in('project_id', (projects || []).map(p => p.id));

  // Create a map of scored project IDs
  const scoredProjectIds = new Set((existingScores || []).map(s => s.project_id));

  return (
    <JudgePortalClient
      eventSlug={params.eventSlug}
      event={event}
      judge={{
        id: user.id,
        name: profile.full_name || user.email?.split('@')[0] || 'Judge',
        email: user.email || '',
        avatar: profile.avatar_url,
        specialty: profile.title || 'Judge',
      }}
      criteria={criteria || []}
      projects={projects || []}
      existingScores={existingScores || []}
      scoredProjectIds={Array.from(scoredProjectIds)}
    />
  );
}
