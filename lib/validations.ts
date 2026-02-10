import { z } from "zod";

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

export const emailSchema = z.string().email("Please enter a valid email address");

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s-()]{10,}$/, "Please enter a valid phone number")
  .optional()
  .or(z.literal(""));

export const urlSchema = z.string().url("Please enter a valid URL").optional().or(z.literal(""));

export const githubUrlSchema = z
  .string()
  .regex(/^https?:\/\/github\.com\/[\w-]+\/[\w.-]+$/, "Please enter a valid GitHub repository URL");

export const githubUsernameSchema = z
  .string()
  .regex(
    /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
    "Please enter a valid GitHub username"
  )
  .optional()
  .or(z.literal(""));

// =============================================================================
// AUTH SCHEMAS
// =============================================================================

export const loginSchema = z.object({
  email: emailSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  full_name: z.string().min(2, "Name must be at least 2 characters"),
});

// =============================================================================
// PROFILE SCHEMAS
// =============================================================================

export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  phone: phoneSchema,
  school: z.string().optional(),
  school_other: z.string().optional(),
  graduation_year: z.number().min(2000).max(2035).optional(),
  field_of_study: z.string().optional(),
  github_username: githubUsernameSchema,
  linkedin_url: urlSchema,
  portfolio_url: urlSchema,
  skill_level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  tshirt_size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "3XL"]).optional(),
  dietary_restrictions: z.string().optional(),
  accessibility_requirements: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: phoneSchema,
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// =============================================================================
// REGISTRATION SCHEMAS
// =============================================================================

export const registrationStep1Schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  phone: z.string().min(10, "Please enter a valid phone number"),
  school: z.string().min(1, "Please select your school"),
  school_other: z.string().optional(),
  github_username: z.string().min(1, "GitHub username is required"),
  linkedin_url: urlSchema,
  skill_level: z.enum(["beginner", "intermediate", "advanced", "expert"], {
    required_error: "Please select your skill level",
  }),
});

export const registrationStep2Schema = z.discriminatedUnion("team_option", [
  z.object({
    team_option: z.literal("create"),
    team_name: z.string().min(2, "Team name must be at least 2 characters"),
    team_description: z.string().optional(),
    max_members: z.number().min(2).max(6).default(4),
  }),
  z.object({
    team_option: z.literal("join"),
    join_code: z.string().length(6, "Join code must be 6 characters"),
  }),
  z.object({
    team_option: z.literal("solo"),
    looking_for_team: z.boolean().default(false),
  }),
]);

export const registrationStep3Schema = z.object({
  dietary_restrictions: z.string().optional(),
  tshirt_size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "3XL"], {
    required_error: "Please select your t-shirt size",
  }),
  how_did_you_hear: z.string().optional(),
  emergency_contact_name: z.string().min(1, "Emergency contact name is required"),
  emergency_contact_phone: z.string().min(10, "Please enter a valid phone number"),
  agreed_to_coc: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Code of Conduct" }),
  }),
  agreed_to_photo_release: z.boolean(),
  agreed_to_terms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Terms and Conditions" }),
  }),
  marketing_emails: z.boolean().default(false),
});

export const fullRegistrationSchema = registrationStep1Schema
  .merge(registrationStep3Schema)
  .extend({
    team_option: z.enum(["create", "join", "solo"]),
    team_name: z.string().optional(),
    team_description: z.string().optional(),
    max_members: z.number().optional(),
    join_code: z.string().optional(),
    looking_for_team: z.boolean().optional(),
  });

export type RegistrationStep1Data = z.infer<typeof registrationStep1Schema>;
export type RegistrationStep2Data = z.infer<typeof registrationStep2Schema>;
export type RegistrationStep3Data = z.infer<typeof registrationStep3Schema>;
export type FullRegistrationData = z.infer<typeof fullRegistrationSchema>;

// =============================================================================
// TEAM SCHEMAS
// =============================================================================

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(50, "Team name must be less than 50 characters"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
  max_members: z.number().min(2).max(6).default(4),
  is_open: z.boolean().default(true),
  looking_for_skills: z.array(z.string()).optional(),
});

export const joinTeamSchema = z.object({
  join_code: z
    .string()
    .length(6, "Join code must be 6 characters")
    .toUpperCase(),
  role: z.string().optional(),
});

export type CreateTeamData = z.infer<typeof createTeamSchema>;
export type JoinTeamData = z.infer<typeof joinTeamSchema>;

// =============================================================================
// PROJECT SCHEMAS
// =============================================================================

export const projectSchema = z.object({
  title: z
    .string()
    .min(3, "Project title must be at least 3 characters")
    .max(100, "Project title must be less than 100 characters"),
  tagline: z.string().max(150, "Tagline must be less than 150 characters").optional(),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must be less than 2000 characters"),
  problem_statement: z.string().max(500).optional(),
  solution: z.string().max(500).optional(),
  github_url: githubUrlSchema,
  demo_url: urlSchema,
  video_url: urlSchema,
  presentation_url: urlSchema,
  tech_stack: z.array(z.string()).min(1, "Please select at least one technology"),
  challenges: z.string().max(500).optional(),
  accomplishments: z.string().max(500).optional(),
  learnings: z.string().max(500).optional(),
  whats_next: z.string().max(500).optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// =============================================================================
// SCORE SCHEMAS
// =============================================================================

export const scoreSchema = z.object({
  innovation_score: z.number().min(1).max(10),
  technical_score: z.number().min(1).max(10),
  presentation_score: z.number().min(1).max(10),
  impact_score: z.number().min(1).max(10),
  comments: z.string().max(1000, "Comments must be less than 1000 characters").optional(),
  private_notes: z.string().max(500).optional(),
});

export type ScoreFormData = z.infer<typeof scoreSchema>;

// =============================================================================
// EVENT SCHEMAS (Admin)
// =============================================================================

export const eventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  tagline: z.string().max(150).optional(),
  description: z.string().optional(),
  theme: z.string().optional(),
  rules: z.string().optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  registration_deadline: z.string().datetime(),
  submission_deadline: z.string().datetime(),
  location: z.string().optional(),
  location_address: z.string().optional(),
  is_virtual: z.boolean().default(false),
  virtual_link: urlSchema,
  max_participants: z.number().min(10).optional(),
  max_team_size: z.number().min(1).max(10).default(4),
  min_team_size: z.number().min(1).max(10).default(1),
  allow_solo_participants: z.boolean().default(true),
  organizer_name: z.string().optional(),
  organizer_email: emailSchema.optional(),
  website_url: urlSchema,
  twitter_url: urlSchema,
  linkedin_url: urlSchema,
  discord_url: urlSchema,
});

export type EventFormData = z.infer<typeof eventSchema>;

// =============================================================================
// SPONSOR SCHEMAS
// =============================================================================

export const sponsorSchema = z.object({
  name: z.string().min(1, "Sponsor name is required"),
  description: z.string().max(500).optional(),
  tier: z.enum(["title", "platinum", "gold", "silver", "bronze", "partner", "media"]),
  logo_url: z.string().url("Please provide a valid logo URL"),
  website_url: urlSchema,
  contact_name: z.string().optional(),
  contact_email: emailSchema.optional(),
  display_order: z.number().default(0),
  is_featured: z.boolean().default(false),
});

export type SponsorFormData = z.infer<typeof sponsorSchema>;

// =============================================================================
// JUDGE SCHEMAS
// =============================================================================

export const judgeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  company: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().max(500).optional(),
  expertise: z.array(z.string()).optional(),
});

export type JudgeFormData = z.infer<typeof judgeSchema>;

// =============================================================================
// FEEDBACK SCHEMAS
// =============================================================================

export const feedbackSchema = z.object({
  overall_rating: z.number().min(1).max(5),
  organization_rating: z.number().min(1).max(5).optional(),
  venue_rating: z.number().min(1).max(5).optional(),
  food_rating: z.number().min(1).max(5).optional(),
  mentorship_rating: z.number().min(1).max(5).optional(),
  nps_score: z.number().min(0).max(10).optional(),
  would_recommend: z.boolean().optional(),
  liked_most: z.string().max(1000).optional(),
  improvements: z.string().max(1000).optional(),
  additional_comments: z.string().max(1000).optional(),
  testimonial: z.string().max(500).optional(),
  can_use_testimonial: z.boolean().default(false),
  is_anonymous: z.boolean().default(false),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

// =============================================================================
// ANNOUNCEMENT SCHEMAS
// =============================================================================

export const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  audience: z.enum(["all", "participants", "team_leaders", "judges", "mentors"]).default("all"),
  is_pinned: z.boolean().default(false),
  send_email: z.boolean().default(false),
  send_push: z.boolean().default(false),
});

export type AnnouncementFormData = z.infer<typeof announcementSchema>;

// =============================================================================
// CONTACT SCHEMAS
// =============================================================================

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  company: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must be less than 2000 characters"),
  type: z.enum(["general", "sponsorship", "partnership", "support", "other"]).default("general"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
