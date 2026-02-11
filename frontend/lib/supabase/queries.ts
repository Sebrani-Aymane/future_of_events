// @ts-nocheck
// TODO: Generate proper Supabase types with `supabase gen types typescript`
// This file is disabled from TypeScript checking until types are generated

import { supabase } from "./client";
import type {
  Event,
  Profile,
  Team,
  TeamMember,
  Registration,
  Project,
  Judge,
  Score,
  Sponsor,
  ActivityFeedItem,
  TeamWithMembers,
  ProjectWithTeam,
  RegistrationWithProfile,
  EventWithStats,
} from "@/types";

// =============================================================================
// EVENT QUERIES
// =============================================================================

export async function getEvents(options?: { activeOnly?: boolean; publishedOnly?: boolean }) {
  let query = supabase.from("events").select("*").order("start_date", { ascending: false });

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  if (options?.publishedOnly) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Event[];
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Event;
}

export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Event;
}

export async function getEventWithStats(slug: string): Promise<EventWithStats | null> {
  const event = await getEventBySlug(slug);
  if (!event) return null;

  const [registrations, teams, projects] = await Promise.all([
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id),
    supabase.from("teams").select("id", { count: "exact", head: true }).eq("event_id", event.id),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .in("status", ["submitted", "under_review", "finalist", "winner"]),
  ]);

  return {
    ...event,
    _count: {
      registrations: registrations.count ?? 0,
      teams: teams.count ?? 0,
      projects: projects.count ?? 0,
    },
  };
}

// =============================================================================
// PROFILE QUERIES
// =============================================================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function createProfile(profile: Omit<Profile, "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("profiles").insert(profile).select().single();

  if (error) throw error;
  return data as Profile;
}

// =============================================================================
// TEAM QUERIES
// =============================================================================

export async function getTeamsByEvent(eventId: string): Promise<TeamWithMembers[]> {
  const { data, error } = await supabase
    .from("teams")
    .select(
      `
      *,
      leader:profiles!teams_leader_id_fkey(*),
      members:team_members(
        *,
        profile:profiles(*)
      ),
      project:projects(*)
    `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as TeamWithMembers[];
}

export async function getTeamByJoinCode(joinCode: string): Promise<TeamWithMembers | null> {
  const { data, error } = await supabase
    .from("teams")
    .select(
      `
      *,
      leader:profiles!teams_leader_id_fkey(*),
      members:team_members(
        *,
        profile:profiles(*)
      )
    `
    )
    .eq("join_code", joinCode.toUpperCase())
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as unknown as TeamWithMembers;
}

export async function getTeamById(teamId: string): Promise<TeamWithMembers | null> {
  const { data, error } = await supabase
    .from("teams")
    .select(
      `
      *,
      leader:profiles!teams_leader_id_fkey(*),
      members:team_members(
        *,
        profile:profiles(*)
      ),
      project:projects(*)
    `
    )
    .eq("id", teamId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as unknown as TeamWithMembers;
}

export async function getUserTeamForEvent(
  userId: string,
  eventId: string
): Promise<TeamWithMembers | null> {
  // First, find team membership
  const { data: membership, error: membershipError } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (membershipError) {
    if (membershipError.code === "PGRST116") return null;
    throw membershipError;
  }

  // Check if team belongs to this event
  const team = await getTeamById(membership.team_id);
  if (!team || team.event_id !== eventId) return null;

  return team;
}

export async function createTeam(
  teamData: Omit<Team, "id" | "join_code" | "created_at" | "updated_at">
): Promise<Team> {
  // Generate unique join code
  const joinCode = generateJoinCode();

  const { data, error } = await supabase
    .from("teams")
    .insert({ ...teamData, join_code: joinCode })
    .select()
    .single();

  if (error) throw error;

  // Add leader as team member
  await supabase.from("team_members").insert({
    team_id: data.id,
    user_id: teamData.leader_id,
    role: "Leader",
    status: "active",
  });

  return data as Team;
}

export async function joinTeam(teamId: string, userId: string, role?: string): Promise<TeamMember> {
  const { data, error } = await supabase
    .from("team_members")
    .insert({
      team_id: teamId,
      user_id: userId,
      role: role ?? null,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function leaveTeam(teamId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .update({ status: "left" })
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) throw error;
}

function generateJoinCode(length: number = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// =============================================================================
// REGISTRATION QUERIES
// =============================================================================

export async function getRegistration(
  eventId: string,
  userId: string
): Promise<Registration | null> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Registration;
}

export async function getEventRegistrations(eventId: string): Promise<RegistrationWithProfile[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
      *,
      profile:profiles(*),
      team:teams(*)
    `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as RegistrationWithProfile[];
}

export async function createRegistration(
  registration: Omit<Registration, "id" | "created_at" | "updated_at">
): Promise<Registration> {
  const { data, error } = await supabase
    .from("registrations")
    .insert(registration)
    .select()
    .single();

  if (error) throw error;
  return data as Registration;
}

export async function updateRegistration(
  id: string,
  updates: Partial<Registration>
): Promise<Registration> {
  const { data, error } = await supabase
    .from("registrations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Registration;
}

// =============================================================================
// PROJECT QUERIES
// =============================================================================

export async function getProjectsByEvent(eventId: string): Promise<ProjectWithTeam[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      team:teams(
        *,
        leader:profiles!teams_leader_id_fkey(*),
        members:team_members(
          *,
          profile:profiles(*)
        )
      )
    `
    )
    .eq("event_id", eventId)
    .in("status", ["submitted", "under_review", "finalist", "winner"])
    .order("average_score", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data as unknown as ProjectWithTeam[];
}

export async function getProjectById(projectId: string): Promise<ProjectWithTeam | null> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      team:teams(
        *,
        leader:profiles!teams_leader_id_fkey(*),
        members:team_members(
          *,
          profile:profiles(*)
        )
      ),
      scores(*)
    `
    )
    .eq("id", projectId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as unknown as ProjectWithTeam;
}

export async function getTeamProject(teamId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("team_id", teamId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Project;
}

export async function createProject(
  project: Omit<Project, "id" | "average_score" | "total_votes" | "created_at" | "updated_at">
): Promise<Project> {
  const { data, error } = await supabase.from("projects").insert(project).select().single();

  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function submitProject(projectId: string): Promise<Project> {
  return updateProject(projectId, {
    status: "submitted",
    submitted_at: new Date().toISOString(),
  });
}

// =============================================================================
// JUDGE QUERIES
// =============================================================================

export async function getJudgeByCode(judgeCode: string): Promise<Judge | null> {
  const { data, error } = await supabase
    .from("judges")
    .select("*")
    .eq("judge_code", judgeCode.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Judge;
}

export async function getEventJudges(eventId: string): Promise<Judge[]> {
  const { data, error } = await supabase
    .from("judges")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Judge[];
}

export async function getJudgeAssignedProjects(judgeId: string): Promise<ProjectWithTeam[]> {
  const judge = await supabase.from("judges").select("*").eq("id", judgeId).single();

  if (judge.error) throw judge.error;

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      team:teams(
        *,
        leader:profiles!teams_leader_id_fkey(*),
        members:team_members(
          *,
          profile:profiles(*)
        )
      )
    `
    )
    .eq("event_id", judge.data.event_id)
    .in("status", ["submitted", "under_review", "finalist"]);

  if (error) throw error;
  return data as unknown as ProjectWithTeam[];
}

// =============================================================================
// SCORE QUERIES
// =============================================================================

export async function getProjectScores(projectId: string): Promise<Score[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_complete", true);

  if (error) throw error;
  return data as Score[];
}

export async function getJudgeScores(judgeId: string): Promise<Score[]> {
  const { data, error } = await supabase.from("scores").select("*").eq("judge_id", judgeId);

  if (error) throw error;
  return data as Score[];
}

export async function submitScore(
  score: Omit<Score, "id" | "total_score" | "updated_at">
): Promise<Score> {
  const { data, error } = await supabase
    .from("scores")
    .upsert(score, { onConflict: "project_id,judge_id" })
    .select()
    .single();

  if (error) throw error;
  return data as Score;
}

// =============================================================================
// SPONSOR QUERIES
// =============================================================================

export async function getEventSponsors(eventId: string): Promise<Sponsor[]> {
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .eq("event_id", eventId)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data as Sponsor[];
}

// =============================================================================
// ACTIVITY FEED QUERIES
// =============================================================================

export async function getEventActivityFeed(
  eventId: string,
  limit: number = 20
): Promise<ActivityFeedItem[]> {
  const { data, error } = await supabase
    .from("activity_feed")
    .select("*")
    .eq("event_id", eventId)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ActivityFeedItem[];
}

// =============================================================================
// LEADERBOARD QUERIES
// =============================================================================

export async function getLeaderboard(eventId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      title,
      tech_stack,
      average_score,
      team:teams(
        id,
        name,
        avatar_url,
        members:team_members(
          profile:profiles(
            full_name,
            avatar_url
          )
        )
      )
    `
    )
    .eq("event_id", eventId)
    .in("status", ["submitted", "under_review", "finalist", "winner"])
    .not("average_score", "is", null)
    .order("average_score", { ascending: false });

  if (error) throw error;

  return data.map((project, index) => ({
    rank: index + 1,
    team: {
      id: (project.team as unknown as Team).id,
      name: (project.team as unknown as Team).name,
      avatar_url: (project.team as unknown as Team).avatar_url,
      members: ((project.team as unknown as TeamWithMembers).members ?? []).map((m) => ({
        full_name: m.profile?.full_name ?? "",
        avatar_url: m.profile?.avatar_url ?? null,
      })),
    },
    project: {
      id: project.id,
      title: project.title,
      tech_stack: project.tech_stack,
    },
    score: project.average_score ?? 0,
  }));
}
