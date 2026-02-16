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

export type EventRegistrationRole = "participant" | "judge" | "admin";

export type EventRegistrationStatus = "pending" | "approved" | "rejected";

// =============================================================================
// JSON FIELD TYPES
// =============================================================================

export interface JudgingCriterion {
  id: string;
  name: string;
  description: string | null;
  weight: number;
  max_score: number;
}

export interface Prize {
  place: number;
  name: string;
  title?: string;
  amount: string;
  description?: string | null;
  sponsor?: string | null;
  perks?: string[];
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string | null;
  location?: string | null;
  type?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface PrizeWon {
  prize_id?: string;
  name: string;
  amount?: string;
  description?: string;
}

// =============================================================================
// TABLE TYPES
// =============================================================================

export type Event = {
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

export type Profile = {
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

export type Team = {
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

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: string | null;
  status: TeamMemberStatus;
  joined_at: string;
}

export type Registration = {
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

export type EventRegistration = {
  id: string;
  event_id: string;
  user_id: string;
  team_id: string | null;
  role: EventRegistrationRole;
  status: EventRegistrationStatus;
  registered_at: string;
  updated_at: string;
}

export type ScoringCriterion = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  weight: number;
  max_score: number;
  order: number;
  created_at: string;
  updated_at: string;
}

export type ScoreDetail = {
  id: string;
  score_id: string;
  criteria_id: string;
  score: number;
  created_at: string;
  updated_at: string;
}

export type Project = {
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

export type Judge = {
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

export type Score = {
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

export type Sponsor = {
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

export type ActivityFeedItem = {
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

export type Announcement = {
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

export type Feedback = {
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
// EXTENDED TYPES (with relations)
// =============================================================================

export type TeamWithMembers = Team & {
  members: (TeamMember & { profile: Profile })[];
  leader: Profile;
  project?: Project;
  _count?: {
    members: number;
  };
}

export type ProjectWithTeam = Project & {
  team: TeamWithMembers;
  scores?: Score[];
}

export type RegistrationWithProfile = Registration & {
  profile: Profile;
  team?: Team;
}

export type EventWithStats = Event & {
  _count: {
    registrations: number;
    teams: number;
    projects: number;
  };
}

export type ScoreWithDetails = Score & {
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

// Identity wrapper – kept for easy refactoring if the Database shape changes.
// NOTE: TypeScript must be pinned to <5.9 because TS 5.9+ removes implicit
// index signatures for mapped types, which breaks Supabase's GenericSchema
// constraint and causes all query results to resolve to `never`.
type DbRecord<T> = T;

export type Database = {
  public: {
    Tables: {
      events: {
        Row: DbRecord<Event>;
        Insert: DbRecord<Omit<Event, "id" | "created_at" | "updated_at">>;
        Update: DbRecord<Partial<Omit<Event, "id" | "created_at">>>;
        Relationships: [];
      };
      profiles: {
        Row: DbRecord<Profile>;
        Insert: DbRecord<Omit<Profile, "created_at" | "updated_at">>;
        Update: DbRecord<Partial<Omit<Profile, "id" | "email" | "created_at">>>;
        Relationships: [];
      };
      teams: {
        Row: DbRecord<Team>;
        Insert: DbRecord<Omit<Team, "id" | "join_code" | "avatar_url" | "created_at" | "updated_at"> & {
          join_code?: string;
          avatar_url?: string | null;
        }>;
        Update: DbRecord<Partial<Omit<Team, "id" | "event_id" | "join_code" | "created_at">>>;
        Relationships: [];
      };
      team_members: {
        Row: DbRecord<TeamMember>;
        Insert: DbRecord<Omit<TeamMember, "id" | "joined_at" | "role"> & {
          role?: string | null;
        }>;
        Update: DbRecord<Partial<Omit<TeamMember, "id" | "team_id" | "user_id" | "joined_at">>>;
        Relationships: [];
      };
      registrations: {
        Row: DbRecord<Registration>;
        Insert: DbRecord<Omit<Registration, "id" | "created_at" | "updated_at">>;
        Update: DbRecord<Partial<Omit<Registration, "id" | "event_id" | "user_id" | "created_at">>>;
        Relationships: [];
      };
      event_registrations: {
        Row: DbRecord<EventRegistration>;
        Insert: DbRecord<Omit<EventRegistration, "id" | "registered_at" | "updated_at"> & {
          registered_at?: string;
          updated_at?: string;
        }>;
        Update: DbRecord<Partial<Omit<EventRegistration, "id" | "event_id" | "user_id" | "registered_at">>>;
        Relationships: [];
      };
      projects: {
        Row: DbRecord<Project>;
        Insert: DbRecord<Omit<Project, "id" | "average_score" | "total_votes" | "created_at" | "updated_at">>;
        Update: DbRecord<Partial<Omit<Project, "id" | "event_id" | "team_id" | "average_score" | "created_at">>>;
        Relationships: [];
      };
      judges: {
        Row: DbRecord<Judge>;
        Insert: DbRecord<Omit<Judge, "id" | "judge_code" | "created_at" | "updated_at">>;
        Update: DbRecord<Partial<Omit<Judge, "id" | "event_id" | "judge_code" | "created_at">>>;
        Relationships: [];
      };
      scores: {
        Row: DbRecord<Score>;
        Insert: DbRecord<Omit<Score, "id" | "total_score" | "updated_at">>;
        Update: DbRecord<Partial<Omit<Score, "id" | "project_id" | "judge_id" | "total_score">>>;
        Relationships: [];
      };
      scoring_criteria: {
        Row: DbRecord<ScoringCriterion>;
        Insert: DbRecord<Omit<ScoringCriterion, "id" | "created_at" | "updated_at">>;
        Update: DbRecord<Partial<Omit<ScoringCriterion, "id" | "event_id" | "created_at">>>;
        Relationships: [];
      };
      score_details: {
        Row: DbRecord<ScoreDetail>;
        Insert: DbRecord<Omit<ScoreDetail, "id" | "created_at" | "updated_at">>;
        Update: DbRecord<Partial<Omit<ScoreDetail, "id" | "score_id" | "criteria_id" | "created_at">>>;
        Relationships: [];
      };
      sponsors: {
        Row: DbRecord<Sponsor>;
        Insert: DbRecord<Omit<Sponsor, "id" | "created_at" | "updated_at">>;
        Update: DbRecord<Partial<Omit<Sponsor, "id" | "event_id" | "created_at">>>;
        Relationships: [];
      };
      activity_feed: {
        Row: DbRecord<ActivityFeedItem>;
        Insert: DbRecord<Omit<ActivityFeedItem, "id" | "created_at">>;
        Update: DbRecord<Partial<Omit<ActivityFeedItem, "id" | "created_at">>>;
        Relationships: [];
      };
      announcements: {
        Row: DbRecord<Announcement>;
        Insert: DbRecord<Omit<Announcement, "id" | "created_at" | "updated_at">>;
        Update: DbRecord<Partial<Omit<Announcement, "id" | "event_id" | "created_at">>>;
        Relationships: [];
      };
      feedback: {
        Row: DbRecord<Feedback>;
        Insert: DbRecord<Omit<Feedback, "id" | "created_at">>;
        Update: DbRecord<Partial<Omit<Feedback, "id" | "event_id" | "created_at">>>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
