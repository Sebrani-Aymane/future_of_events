-- =============================================================================
-- HACKATHON PLATFORM DATABASE SCHEMA
-- =============================================================================
-- Run this script in your Supabase SQL Editor to set up all tables,
-- indexes, functions, and RLS policies.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =============================================================================
-- DROP EXISTING TABLES (in order due to foreign keys)
-- Only uncomment if you need to reset the database
-- =============================================================================
-- DROP TABLE IF EXISTS activity_feed CASCADE;
-- DROP TABLE IF EXISTS scores CASCADE;
-- DROP TABLE IF EXISTS judges CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS sponsors CASCADE;
-- DROP TABLE IF EXISTS registrations CASCADE;
-- DROP TABLE IF EXISTS team_members CASCADE;
-- DROP TABLE IF EXISTS teams CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;

-- =============================================================================
-- EVENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  theme TEXT,
  rules TEXT,
  judging_criteria JSONB DEFAULT '[]'::jsonb,
  prizes JSONB DEFAULT '[]'::jsonb,
  schedule JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  
  -- Dates
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_open_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ NOT NULL,
  submission_deadline TIMESTAMPTZ NOT NULL,
  judging_start_date TIMESTAMPTZ,
  judging_end_date TIMESTAMPTZ,
  
  -- Location
  location TEXT,
  location_address TEXT,
  is_virtual BOOLEAN DEFAULT false,
  virtual_link TEXT,
  
  -- Settings
  max_participants INTEGER,
  max_team_size INTEGER DEFAULT 4,
  min_team_size INTEGER DEFAULT 1,
  allow_solo_participants BOOLEAN DEFAULT true,
  require_team BOOLEAN DEFAULT false,
  
  -- Branding
  logo_url TEXT,
  banner_url TEXT,
  cover_image_url TEXT,
  primary_color TEXT DEFAULT '#00E5FF',
  secondary_color TEXT DEFAULT '#FF6B35',
  
  -- Contact
  organizer_name TEXT,
  organizer_email TEXT,
  website_url TEXT,
  
  -- Social media
  twitter_url TEXT,
  linkedin_url TEXT,
  discord_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  is_registration_open BOOLEAN DEFAULT true,
  is_submission_open BOOLEAN DEFAULT false,
  is_judging_open BOOLEAN DEFAULT false,
  is_results_published BOOLEAN DEFAULT false,
  
  -- Metadata
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active, is_published);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);

-- =============================================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  
  -- School/Organization
  school TEXT,
  school_other TEXT,
  graduation_year INTEGER,
  field_of_study TEXT,
  
  -- Professional links
  github_username TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  
  -- Skills & Experience
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  skills TEXT[],
  bio TEXT,
  
  -- Event logistics
  tshirt_size TEXT CHECK (tshirt_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL')),
  dietary_restrictions TEXT,
  accessibility_requirements TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Profile
  avatar_url TEXT,
  
  -- Role
  role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'judge', 'admin', 'superadmin')),
  
  -- Preferences
  email_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  
  -- Metadata
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_school ON profiles(school);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_github ON profiles(github_username);

-- =============================================================================
-- TEAMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  join_code TEXT UNIQUE NOT NULL,
  leader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Team settings
  max_members INTEGER DEFAULT 4,
  is_open BOOLEAN DEFAULT true,
  looking_for_skills TEXT[],
  
  -- Avatar
  avatar_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_team_name_per_event UNIQUE(event_id, name)
);

-- Indexes for teams
CREATE INDEX IF NOT EXISTS idx_teams_event ON teams(event_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_teams_join_code ON teams(join_code);

-- =============================================================================
-- TEAM MEMBERS TABLE (Junction table)
-- =============================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Role within the team
  role TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'left', 'removed')),
  
  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_team_member UNIQUE(team_id, user_id)
);

-- Indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- =============================================================================
-- REGISTRATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  
  -- Registration details
  registration_type TEXT DEFAULT 'participant' CHECK (registration_type IN ('participant', 'mentor', 'volunteer', 'sponsor_rep')),
  
  -- Status
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'checked_in', 'no_show', 'cancelled')),
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id),
  
  -- Survey data
  how_did_you_hear TEXT,
  expectations TEXT,
  
  -- Agreements
  agreed_to_coc BOOLEAN DEFAULT false,
  agreed_to_photo_release BOOLEAN DEFAULT false,
  agreed_to_terms BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_registration UNIQUE(event_id, user_id)
);

-- Indexes for registrations
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_team ON registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- =============================================================================
-- PROJECTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Project details
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  problem_statement TEXT,
  solution TEXT,
  
  -- Links
  github_url TEXT NOT NULL,
  demo_url TEXT,
  video_url TEXT,
  presentation_url TEXT,
  devpost_url TEXT,
  
  -- Technical details
  tech_stack TEXT[],
  challenges TEXT,
  accomplishments TEXT,
  learnings TEXT,
  whats_next TEXT,
  
  -- Media
  cover_image_url TEXT,
  screenshots TEXT[],
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'finalist', 'winner', 'disqualified')),
  submitted_at TIMESTAMPTZ,
  
  -- Scoring
  average_score DECIMAL(4,2),
  total_votes INTEGER DEFAULT 0,
  
  -- Prize categories
  prize_categories TEXT[],
  prizes_won JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_project_per_team_event UNIQUE(event_id, team_id)
);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_event ON projects(event_id);
CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_score ON projects(average_score DESC);

-- =============================================================================
-- JUDGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS judges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Judge info (for non-registered judges)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  title TEXT,
  bio TEXT,
  avatar_url TEXT,
  expertise TEXT[],
  
  -- Authentication
  judge_code TEXT UNIQUE NOT NULL,
  
  -- Assignment
  assigned_projects UUID[],
  max_projects INTEGER DEFAULT 20,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  has_accepted_invitation BOOLEAN DEFAULT false,
  invitation_sent_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_judge_per_event UNIQUE(event_id, email)
);

-- Indexes for judges
CREATE INDEX IF NOT EXISTS idx_judges_event ON judges(event_id);
CREATE INDEX IF NOT EXISTS idx_judges_user ON judges(user_id);
CREATE INDEX IF NOT EXISTS idx_judges_code ON judges(judge_code);
CREATE INDEX IF NOT EXISTS idx_judges_email ON judges(email);

-- =============================================================================
-- SCORES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Individual scores (1-10 scale)
  innovation_score INTEGER CHECK (innovation_score BETWEEN 1 AND 10),
  technical_score INTEGER CHECK (technical_score BETWEEN 1 AND 10),
  presentation_score INTEGER CHECK (presentation_score BETWEEN 1 AND 10),
  impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 10),
  
  -- Custom criteria scores (stored as JSONB for flexibility)
  custom_scores JSONB DEFAULT '{}'::jsonb,
  
  -- Total score (auto-calculated)
  total_score INTEGER GENERATED ALWAYS AS (
    COALESCE(innovation_score, 0) + 
    COALESCE(technical_score, 0) + 
    COALESCE(presentation_score, 0) + 
    COALESCE(impact_score, 0)
  ) STORED,
  
  -- Feedback
  comments TEXT,
  private_notes TEXT,
  
  -- Status
  is_complete BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  skip_reason TEXT,
  
  -- Metadata
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_score_per_judge_project UNIQUE(project_id, judge_id)
);

-- Indexes for scores
CREATE INDEX IF NOT EXISTS idx_scores_project ON scores(project_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge ON scores(judge_id);
CREATE INDEX IF NOT EXISTS idx_scores_event ON scores(event_id);
CREATE INDEX IF NOT EXISTS idx_scores_total ON scores(total_score DESC);

-- =============================================================================
-- SPONSORS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Sponsor details
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('title', 'platinum', 'gold', 'silver', 'bronze', 'partner', 'media')),
  
  -- Branding
  logo_url TEXT NOT NULL,
  logo_dark_url TEXT,
  website_url TEXT,
  
  -- Contact
  contact_name TEXT,
  contact_email TEXT,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  show_on_homepage BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sponsors
CREATE INDEX IF NOT EXISTS idx_sponsors_event ON sponsors(event_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_tier ON sponsors(tier);
CREATE INDEX IF NOT EXISTS idx_sponsors_order ON sponsors(display_order);

-- =============================================================================
-- ACTIVITY FEED TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Activity details
  type TEXT NOT NULL CHECK (type IN (
    'registration', 'team_created', 'team_joined', 'team_full',
    'project_submitted', 'project_updated', 'score_submitted',
    'winner_announced', 'milestone', 'announcement', 'custom'
  )),
  message TEXT NOT NULL,
  
  -- Related entities
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Display options
  is_public BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  icon TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity_feed
CREATE INDEX IF NOT EXISTS idx_activity_event ON activity_feed(event_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_feed(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_feed(type);
CREATE INDEX IF NOT EXISTS idx_activity_public ON activity_feed(is_public, created_at DESC);

-- =============================================================================
-- ANNOUNCEMENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Targeting
  audience TEXT DEFAULT 'all' CHECK (audience IN ('all', 'participants', 'team_leaders', 'judges', 'mentors')),
  
  -- Scheduling
  publish_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Status
  is_published BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Notifications
  send_email BOOLEAN DEFAULT false,
  send_push BOOLEAN DEFAULT false,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for announcements
CREATE INDEX IF NOT EXISTS idx_announcements_event ON announcements(event_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published, publish_at DESC);

-- =============================================================================
-- FEEDBACK TABLE (Post-event surveys)
-- =============================================================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Ratings (1-5 scale)
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  organization_rating INTEGER CHECK (organization_rating BETWEEN 1 AND 5),
  venue_rating INTEGER CHECK (venue_rating BETWEEN 1 AND 5),
  food_rating INTEGER CHECK (food_rating BETWEEN 1 AND 5),
  mentorship_rating INTEGER CHECK (mentorship_rating BETWEEN 1 AND 5),
  
  -- NPS
  nps_score INTEGER CHECK (nps_score BETWEEN 0 AND 10),
  would_recommend BOOLEAN,
  
  -- Open feedback
  liked_most TEXT,
  improvements TEXT,
  additional_comments TEXT,
  
  -- Testimonial
  testimonial TEXT,
  can_use_testimonial BOOLEAN DEFAULT false,
  
  -- Metadata
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for feedback
CREATE INDEX IF NOT EXISTS idx_feedback_event ON feedback(event_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to generate unique join codes
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate judge codes
CREATE OR REPLACE FUNCTION generate_judge_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'JUDGE-';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate slug from event name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate project average score
CREATE OR REPLACE FUNCTION calculate_project_average_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET average_score = (
    SELECT AVG(total_score)::DECIMAL(4,2)
    FROM scores
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    AND is_complete = true
    AND skipped = false
  )
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to add activity on registration
CREATE OR REPLACE FUNCTION add_registration_activity()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_school TEXT;
BEGIN
  SELECT full_name, school INTO user_name, user_school
  FROM profiles WHERE id = NEW.user_id;
  
  INSERT INTO activity_feed (event_id, type, message, user_id, metadata)
  VALUES (
    NEW.event_id,
    'registration',
    user_name || COALESCE(' from ' || user_school, '') || ' just registered!',
    NEW.user_id,
    jsonb_build_object('registration_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to add activity on team creation
CREATE OR REPLACE FUNCTION add_team_created_activity()
RETURNS TRIGGER AS $$
DECLARE
  leader_name TEXT;
BEGIN
  SELECT full_name INTO leader_name
  FROM profiles WHERE id = NEW.leader_id;
  
  INSERT INTO activity_feed (event_id, type, message, user_id, team_id, metadata)
  VALUES (
    NEW.event_id,
    'team_created',
    leader_name || ' created team "' || NEW.name || '"',
    NEW.leader_id,
    NEW.id,
    jsonb_build_object('team_name', NEW.name)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to add activity on project submission
CREATE OR REPLACE FUNCTION add_project_submitted_activity()
RETURNS TRIGGER AS $$
DECLARE
  team_name TEXT;
BEGIN
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
    SELECT name INTO team_name
    FROM teams WHERE id = NEW.team_id;
    
    INSERT INTO activity_feed (event_id, type, message, team_id, project_id, metadata)
    VALUES (
      NEW.event_id,
      'project_submitted',
      'Team "' || team_name || '" just submitted their project: ' || NEW.title || ' 🚀',
      NEW.team_id,
      NEW.id,
      jsonb_build_object('project_title', NEW.title)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Updated_at triggers
CREATE OR REPLACE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_judges_updated_at
  BEFORE UPDATE ON judges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_scores_updated_at
  BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Score calculation trigger
CREATE OR REPLACE TRIGGER calculate_average_score_on_insert
  AFTER INSERT ON scores
  FOR EACH ROW EXECUTE FUNCTION calculate_project_average_score();

CREATE OR REPLACE TRIGGER calculate_average_score_on_update
  AFTER UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION calculate_project_average_score();

CREATE OR REPLACE TRIGGER calculate_average_score_on_delete
  AFTER DELETE ON scores
  FOR EACH ROW EXECUTE FUNCTION calculate_project_average_score();

-- Activity feed triggers
CREATE OR REPLACE TRIGGER on_registration_add_activity
  AFTER INSERT ON registrations
  FOR EACH ROW EXECUTE FUNCTION add_registration_activity();

CREATE OR REPLACE TRIGGER on_team_created_add_activity
  AFTER INSERT ON teams
  FOR EACH ROW EXECUTE FUNCTION add_team_created_activity();

CREATE OR REPLACE TRIGGER on_project_submitted_add_activity
  AFTER INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION add_project_submitted_activity();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- EVENTS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Events: Public can view published active events"
  ON events FOR SELECT
  USING (is_active = true AND is_published = true);

CREATE POLICY "Events: Admins can do everything"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- -----------------------------------------------------------------------------
-- PROFILES POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Profiles: Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Profiles: Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Profiles: Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles: Public can view basic participant info"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Profiles: Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Profiles: Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'superadmin')
    )
  );

-- -----------------------------------------------------------------------------
-- TEAMS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Teams: Public can view teams for active events"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = teams.event_id
      AND events.is_active = true
    )
  );

CREATE POLICY "Teams: Authenticated users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Teams: Team leaders can update their teams"
  ON teams FOR UPDATE
  USING (auth.uid() = leader_id);

CREATE POLICY "Teams: Team leaders can delete their teams"
  ON teams FOR DELETE
  USING (auth.uid() = leader_id);

CREATE POLICY "Teams: Admins can do everything"
  ON teams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- -----------------------------------------------------------------------------
-- TEAM MEMBERS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Team Members: Public can view team members"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Team Members: Users can join teams"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team Members: Users can leave teams"
  ON team_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Team Members: Team leaders can manage members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.leader_id = auth.uid()
    )
  );

CREATE POLICY "Team Members: Admins can do everything"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- -----------------------------------------------------------------------------
-- REGISTRATIONS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Registrations: Users can view their own registrations"
  ON registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Registrations: Users can create their own registrations"
  ON registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Registrations: Users can update their own registrations"
  ON registrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Registrations: Admins can view all registrations"
  ON registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Registrations: Admins can do everything"
  ON registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- -----------------------------------------------------------------------------
-- PROJECTS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Projects: Public can view submitted projects"
  ON projects FOR SELECT
  USING (status IN ('submitted', 'under_review', 'finalist', 'winner'));

CREATE POLICY "Projects: Team members can view their own projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Projects: Team members can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Projects: Team members can update their projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Projects: Judges can view assigned projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM judges
      WHERE judges.event_id = projects.event_id
      AND judges.user_id = auth.uid()
    )
  );

CREATE POLICY "Projects: Admins can do everything"
  ON projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- -----------------------------------------------------------------------------
-- JUDGES POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Judges: Public can view judge info for events"
  ON judges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Judges: Judges can view their own record"
  ON judges FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Judges: Admins can do everything"
  ON judges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- -----------------------------------------------------------------------------
-- SCORES POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Scores: Judges can view their own scores"
  ON scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM judges
      WHERE judges.id = scores.judge_id
      AND judges.user_id = auth.uid()
    )
  );

CREATE POLICY "Scores: Judges can create scores"
  ON scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM judges
      WHERE judges.id = scores.judge_id
      AND judges.user_id = auth.uid()
    )
  );

CREATE POLICY "Scores: Judges can update their scores"
  ON scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM judges
      WHERE judges.id = scores.judge_id
      AND judges.user_id = auth.uid()
    )
  );

CREATE POLICY "Scores: Admins can do everything"
  ON scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- -----------------------------------------------------------------------------
-- SPONSORS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Sponsors: Public can view sponsors"
  ON sponsors FOR SELECT
  USING (true);

CREATE POLICY "Sponsors: Admins can do everything"
  ON sponsors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- -----------------------------------------------------------------------------
-- ACTIVITY FEED POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Activity Feed: Public can view public activities"
  ON activity_feed FOR SELECT
  USING (is_public = true);

CREATE POLICY "Activity Feed: Admins can do everything"
  ON activity_feed FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- -----------------------------------------------------------------------------
-- ANNOUNCEMENTS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Announcements: Public can view published announcements"
  ON announcements FOR SELECT
  USING (is_published = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Announcements: Admins can do everything"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- -----------------------------------------------------------------------------
-- FEEDBACK POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Feedback: Users can create feedback"
  ON feedback FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_anonymous = true);

CREATE POLICY "Feedback: Users can view their own feedback"
  ON feedback FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Feedback: Admins can view all feedback"
  ON feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- =============================================================================
-- STORAGE BUCKETS (Run separately in Supabase Dashboard or via API)
-- =============================================================================

-- Create buckets for file storage
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES 
--   ('avatars', 'avatars', true),
--   ('logos', 'logos', true),
--   ('covers', 'covers', true),
--   ('projects', 'projects', true),
--   ('certificates', 'certificates', false);

-- =============================================================================
-- REALTIME SUBSCRIPTIONS
-- =============================================================================

-- Enable realtime for specific tables
-- Run this in the Supabase Dashboard SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE scores;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;

-- =============================================================================
-- SEED DATA FOR TESTING (Optional - Remove in production)
-- =============================================================================

-- Insert a sample admin user (after they sign up via auth)
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@yourdomain.com';

-- Insert a sample event
-- INSERT INTO events (
--   name, slug, tagline, description, theme,
--   start_date, end_date, registration_deadline, submission_deadline,
--   location, max_participants, max_team_size,
--   is_active, is_published, is_registration_open
-- ) VALUES (
--   '1337 hackathon 2026',
--   '1337-hackathon-2024',
--   'Build the Future of Morocco',
--   'Join the biggest coding competition at 1337...',
--   'AI & Sustainability',
--   '2024-03-15 09:00:00+00',
--   '2024-03-17 18:00:00+00',
--   '2024-03-10 23:59:00+00',
--   '2024-03-17 16:00:00+00',
--   '1337 Khouribga, Morocco',
--   200,
--   4,
--   true, true, true
-- );

COMMIT;
