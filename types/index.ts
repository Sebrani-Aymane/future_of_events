// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Re-export all database types
export * from "./database";

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

import type { LucideIcon } from "lucide-react";
import type { HTMLMotionProps } from "framer-motion";

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  badge?: string;
}

export interface StatCard {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  status?: "completed" | "current" | "upcoming";
}

export interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  team: {
    id: string;
    name: string;
    avatar_url?: string;
    members: { full_name: string; avatar_url?: string }[];
  };
  project: {
    id: string;
    title: string;
    tech_stack?: string[];
  };
  score: number;
  judgeCount: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

// =============================================================================
// MOTION TYPES
// =============================================================================

export type MotionDivProps = HTMLMotionProps<"div">;
export type MotionSectionProps = HTMLMotionProps<"section">;
export type MotionSpanProps = HTMLMotionProps<"span">;

// =============================================================================
// FORM TYPES
// =============================================================================

export interface FieldError {
  message: string;
  type: string;
}

export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, FieldError>;
}

// =============================================================================
// FILTER & SORT TYPES
// =============================================================================

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterConfig {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "in";
  value: string | number | boolean | string[] | number[];
}

export interface PaginationConfig {
  page: number;
  perPage: number;
}

export interface QueryConfig {
  sort?: SortConfig;
  filters?: FilterConfig[];
  pagination?: PaginationConfig;
  search?: string;
}

// =============================================================================
// REALTIME TYPES
// =============================================================================

export interface RealtimePayload<T> {
  commit_timestamp: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T | null;
  schema: string;
  table: string;
}

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: AuthUser;
}

// =============================================================================
// CERTIFICATE TYPES
// =============================================================================

export interface CertificateData {
  recipientName: string;
  eventName: string;
  eventDate: string;
  certificateType: "participant" | "winner" | "judge" | "volunteer";
  teamName?: string;
  projectTitle?: string;
  placement?: number;
  issueDate: string;
  certificateId: string;
}

// =============================================================================
// CHART TYPES
// =============================================================================

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

// =============================================================================
// FILE UPLOAD TYPES
// =============================================================================

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

// =============================================================================
// THEME TYPES
// =============================================================================

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

// =============================================================================
// ENVIRONMENT TYPES
// =============================================================================

export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appUrl: string;
  appName: string;
  supportEmail: string;
  enableRealtime: boolean;
  enableAnalytics: boolean;
}
