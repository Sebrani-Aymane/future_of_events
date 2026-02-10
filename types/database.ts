// =============================================================================
// DATABASE TYPES - Auto-generated from Supabase schema
// =============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// =============================================================================
// ENUMS
// =============================================================================

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type TShirtSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "3XL";

export type UserRole = "participant" | "judge" | "admin" | "superadmin";

export type RegistrationType = "participant" | "mentor" | "volunteer" | "sponsor_rep";

export type RegistrationStatus = "registered" | "confirmed" | "checked_in" | "no_show" | "cancelled";

export type ProjectStatus = "draft" | "submitted" | "under_review" | "finalist" | "winner" | "disqualified";

export type TeamMemberStatus = "pending" | "active" | "left" | "removed";

export type SponsorTier = "title" | "platinum" | "gold" | "silver" | "bronze" | "partner" | "media";

export type ActivityType =
  | "registration"
  | "team_created"
  | "team_joined"
  | "team_full"
  | "project_submitted"
  | "project_updated"
  | "score_submitted"
  | "winner_announced"
  | "milestone"
  | "announcement"
  | "custom";

export type AnnouncementAudience = "all" | "participants" | "team_leaders" | "judges" | "mentors";

// =============================================================================
// TABLE TYPES
// =============================================================================

export interface Event {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  theme: string | null;
  rules: string | null;
  judging_criteria: JudgingCriterion[];
  prizes: Prize[];
  schedule: ScheduleItem[];
  faqs: FAQ[];
  
  // Dates
  start_date: string;
  end_date: string;
  registration_open_date: string | null;
  registration_deadline: string;
  submission_deadline: string;
  judging_start_date: string | null;
  judging_end_date: string | null;
  
  // Location
  location: string | null;
  location_address: string | null;
  is_virtual: boolean;
  virtual_link: string | null;
  
  // Settings
  max_participants: number | null;
  max_team_size: number;
  min_team_size: number;
  allow_solo_participants: boolean;
  require_team: boolean;
  
  // Branding
  logo_url: string | null;
  banner_url: string | null;
  cover_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  
  // Contact
  organizer_name: string | null;
  organizer_email: string | null;
  website_url: string | null;
  
  // Social media
  twitter_url: string | null;
  linkedin_url: string | null;
  discord_url: string | null;
  
  // Status
  is_active: boolean;
  is_published: boolean;
  is_registration_open: boolean;
  is_submission_open: boolean;
  is_judging_open: boolean;
  is_results_published: boolean;
  
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  
  // School/Organization
  school: string | null;
  school_other: string | null;
  graduation_year: number | null;
  field_of_study: string | null;
  
  // Professional links
  github_username: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  
  // Skills & Experience
  skill_level: SkillLevel | null;
  skills: string[] | null;
  bio: string | null;
  
  // Event logistics
  tshirt_size: TShirtSize | null;
  dietary_restrictions: string | null;
  accessibility_requirements: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  
  // Profile
  avatar_url: string | null;
  
  // Role
  role: UserRole;
  
  // Preferences
  email_notifications: boolean;
  marketing_emails: boolean;
  
  // Metadata
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  join_code: string;
  leader_id: string;
  
  // Team settings
  max_members: number;
  is_open: boolean;
  looking_for_skills: string[] | null;
  
  // Avatar
  avatar_url: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string | null;
  status: TeamMemberStatus;
  joined_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  team_id: string | null;
  
  // Registration details
  registration_type: RegistrationType;
  
  // Status
  status: RegistrationStatus;
  checked_in_at: string | null;
  checked_in_by: string | null;
  
  // Survey data
  how_did_you_hear: string | null;
  expectations: string | null;
  
  // Agreements
  agreed_to_coc: boolean;
  agreed_to_photo_release: boolean;
  agreed_to_terms: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  event_id: string;
  team_id: string;
  
  // Project details
  title: string;
  tagline: string | null;
  description: string;
  problem_statement: string | null;
  solution: string | null;
  
  // Links
  github_url: string;
  demo_url: string | null;
  video_url: string | null;
  presentation_url: string | null;
  devpost_url: string | null;
  
  // Technical details
  tech_stack: string[] | null;
  challenges: string | null;
  accomplishments: string | null;
  learnings: string | null;
  whats_next: string | null;
  
  // Media
  cover_image_url: string | null;
  screenshots: string[] | null;
  
  // Status
  status: ProjectStatus;
  submitted_at: string | null;
  
  // Scoring
  average_score: number | null;
  total_votes: number;
  
  // Prize categories
  prize_categories: string[] | null;
  prizes_won: PrizeWon[];
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface Judge {
  id: string;
  event_id: string;
  user_id: string | null;
  
  // Judge info
  name: string;
  email: string;
  company: string | null;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  expertise: string[] | null;
  
  // Authentication
  judge_code: string;
  
  // Assignment
  assigned_projects: string[] | null;
  max_projects: number;
  
  // Status
  is_active: boolean;
  has_accepted_invitation: boolean;
  invitation_sent_at: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  project_id: string;
  judge_id: string;
  event_id: string;
  
  // Individual scores (1-10 scale)
  innovation_score: number | null;
  technical_score: number | null;
  presentation_score: number | null;
  impact_score: number | null;
  
  // Custom criteria scores
  custom_scores: Record<string, number>;
  
  // Total score (auto-calculated)
  total_score: number;
  
  // Feedback
  comments: string | null;
  private_notes: string | null;
  
  // Status
  is_complete: boolean;
  skipped: boolean;
  skip_reason: string | null;
  
  // Metadata
  started_at: string | null;
  submitted_at: string | null;
  updated_at: string;
}

export interface Sponsor {
  id: string;
  event_id: string;
  
  // Sponsor details
  name: string;
  description: string | null;
  tier: SponsorTier;
  
  // Branding
  logo_url: string;
  logo_dark_url: string | null;
  website_url: string | null;
  
  // Contact
  contact_name: string | null;
  contact_email: string | null;
  
  // Display
  display_order: number;
  is_featured: boolean;
  show_on_homepage: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface ActivityFeedItem {
  id: string;
  event_id: string;
  
  // Activity details
  type: ActivityType;
  message: string;
  
  // Related entities
  user_id: string | null;
  team_id: string | null;
  project_id: string | null;
  
  // Display options
  is_public: boolean;
  is_pinned: boolean;
  icon: string | null;
  
  // Metadata
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Announcement {
  id: string;
  event_id: string;
  
  // Content
  title: string;
  content: string;
  
  // Targeting
  audience: AnnouncementAudience;
  
  // Scheduling
  publish_at: string;
  expires_at: string | null;
  
  // Status
  is_published: boolean;
  is_pinned: boolean;
  
  // Notifications
  send_email: boolean;
  send_push: boolean;
  
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  event_id: string;
  user_id: string | null;
  
  // Ratings (1-5 scale)
  overall_rating: number | null;
  organization_rating: number | null;
  venue_rating: number | null;
  food_rating: number | null;
  mentorship_rating: number | null;
  
  // NPS
  nps_score: number | null;
  would_recommend: boolean | null;
  
  // Open feedback
  liked_most: string | null;
  improvements: string | null;
  additional_comments: string | null;
  
  // Testimonial
  testimonial: string | null;
  can_use_testimonial: boolean;
  
  // Metadata
  is_anonymous: boolean;
  created_at: string;
}

// =============================================================================
// JSON FIELD TYPES
// =============================================================================

export interface Prize {
  place: number;
  name: string;
  amount: string;
  description: string | null;
  sponsor: string | null;
}

export interface PrizeWon {
  prize_id: string;
  name: string;
  amount: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string | null;
  location: string | null;
  type: "ceremony" | "workshop" | "break" | "deadline" | "custom";
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface JudgingCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  max_score: number;
}

// =============================================================================
// EXTENDED TYPES (with relations)
// =============================================================================

export interface TeamWithMembers extends Team {
  members: (TeamMember & { profile: Profile })[];
  leader: Profile;
  project?: Project;
  _count?: {
    members: number;
  };
}

export interface ProjectWithTeam extends Project {
  team: TeamWithMembers;
  scores?: Score[];
}

export interface RegistrationWithProfile extends Registration {
  profile: Profile;
  team?: Team;
}

export interface EventWithStats extends Event {
  _count: {
    registrations: number;
    teams: number;
    projects: number;
  };
}

export interface ScoreWithDetails extends Score {
  judge: Judge;
  project: Project;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// =============================================================================
// FORM INPUT TYPES
// =============================================================================

export interface CreateEventInput {
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  theme?: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  submission_deadline: string;
  location?: string;
  is_virtual?: boolean;
  max_participants?: number;
  max_team_size?: number;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

export interface CreateProfileInput {
  email: string;
  full_name: string;
  phone?: string;
  school?: string;
  github_username?: string;
  linkedin_url?: string;
  skill_level?: SkillLevel;
  tshirt_size?: TShirtSize;
}

export interface UpdateProfileInput extends Partial<Omit<CreateProfileInput, "email">> {
  id: string;
}

export interface CreateTeamInput {
  event_id: string;
  name: string;
  description?: string;
  max_members?: number;
  is_open?: boolean;
  looking_for_skills?: string[];
}

export interface JoinTeamInput {
  join_code: string;
  role?: string;
}

export interface CreateProjectInput {
  event_id: string;
  team_id: string;
  title: string;
  description: string;
  github_url: string;
  demo_url?: string;
  video_url?: string;
  tech_stack?: string[];
}

export interface UpdateProjectInput extends Partial<Omit<CreateProjectInput, "event_id" | "team_id">> {
  id: string;
}

export interface SubmitScoreInput {
  project_id: string;
  judge_id: string;
  event_id: string;
  innovation_score: number;
  technical_score: number;
  presentation_score: number;
  impact_score: number;
  comments?: string;
}

export interface CreateRegistrationInput {
  event_id: string;
  registration_type?: RegistrationType;
  how_did_you_hear?: string;
  expectations?: string;
  agreed_to_coc: boolean;
  agreed_to_photo_release: boolean;
  agreed_to_terms: boolean;
}

// =============================================================================
// SUPABASE DATABASE TYPE
// =============================================================================

export interface Database {
  public: {
    Tables: {
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Event, "id" | "created_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "email" | "created_at">>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, "id" | "join_code" | "created_at" | "updated_at">;
        Update: Partial<Omit<Team, "id" | "event_id" | "join_code" | "created_at">>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, "id" | "joined_at">;
        Update: Partial<Omit<TeamMember, "id" | "team_id" | "user_id" | "joined_at">>;
      };
      registrations: {
        Row: Registration;
        Insert: Omit<Registration, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Registration, "id" | "event_id" | "user_id" | "created_at">>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "average_score" | "total_votes" | "created_at" | "updated_at">;
        Update: Partial<Omit<Project, "id" | "event_id" | "team_id" | "average_score" | "created_at">>;
      };
      judges: {
        Row: Judge;
        Insert: Omit<Judge, "id" | "judge_code" | "created_at" | "updated_at">;
        Update: Partial<Omit<Judge, "id" | "event_id" | "judge_code" | "created_at">>;
      };
      scores: {
        Row: Score;
        Insert: Omit<Score, "id" | "total_score" | "updated_at">;
        Update: Partial<Omit<Score, "id" | "project_id" | "judge_id" | "total_score">>;
      };
      sponsors: {
        Row: Sponsor;
        Insert: Omit<Sponsor, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Sponsor, "id" | "event_id" | "created_at">>;
      };
      activity_feed: {
        Row: ActivityFeedItem;
        Insert: Omit<ActivityFeedItem, "id" | "created_at">;
        Update: Partial<Omit<ActivityFeedItem, "id" | "created_at">>;
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Announcement, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Announcement, "id" | "event_id" | "created_at">>;
      };
      feedback: {
        Row: Feedback;
        Insert: Omit<Feedback, "id" | "created_at">;
        Update: Partial<Omit<Feedback, "id" | "event_id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_join_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      generate_judge_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      generate_slug: {
        Args: { name: string };
        Returns: string;
      };
    };
    Enums: {
      skill_level: SkillLevel;
      tshirt_size: TShirtSize;
      user_role: UserRole;
      registration_type: RegistrationType;
      registration_status: RegistrationStatus;
      project_status: ProjectStatus;
      team_member_status: TeamMemberStatus;
      sponsor_tier: SponsorTier;
      activity_type: ActivityType;
      announcement_audience: AnnouncementAudience;
    };
  };
}
