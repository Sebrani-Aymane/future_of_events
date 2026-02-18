"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// =============================================================================
// TYPES
// =============================================================================

export type AuthResult = {
  success: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
};

export type SignUpData = {
  email: string;
  password: string;
  fullName: string;
  metadata?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    occupation?: string;
    school?: string;
    company?: string;
    role?: string;
    experienceLevel?: string;
    skills?: string[];
    github?: string;
    linkedin?: string;
    portfolio?: string;
    tshirtSize?: string;
    dietaryRestrictions?: string;
    teamPreference?: string;
  };
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${host}`;
}
// =============================================================================
// SIGN UP
// =============================================================================

export async function signUp(data: SignUpData): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?type=signup`,
      data: {
        full_name: data.fullName,
        ...data.metadata,
      },
    },
  });

  if (authError) {
    return {
      success: false,
      error: authError.message,
    };
  }

  // Check if email confirmation is required
  if (authData.user && !authData.session) {
    // Email confirmation required
    return {
      success: true,
      message: "Please check your email to verify your account.",
      redirectTo: "/verify-email",
    };
  }

  // If we have a session (email confirmation disabled), create profile
  if (authData.user && authData.session) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: data.email,
      full_name: data.fullName,
      school: data.metadata?.school || null,
      github_username: data.metadata?.github?.replace("https://github.com/", "") || null,
      linkedin_url: data.metadata?.linkedin || null,
      portfolio_url: data.metadata?.portfolio || null,
      skill_level: data.metadata?.experienceLevel || null,
      skills: data.metadata?.skills || null,
      bio: data.metadata?.bio || null,
      tshirt_size: data.metadata?.tshirtSize || null,
      dietary_restrictions: data.metadata?.dietaryRestrictions || null,
      role: "participant",
    } as any);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't fail the signup, profile can be created later
    }

    return {
      success: true,
      message: "Account created successfully!",
      redirectTo: "/dashboard",
    };
  }

  return {
    success: true,
    message: "Please check your email to verify your account.",
    redirectTo: "/verify-email",
  };
}

// =============================================================================
// SIGN IN
// =============================================================================

export async function signIn(
  email: string,
  password: string,
  redirectTo?: string
): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return {
        success: false,
        error: "Please verify your email before signing in. Check your inbox for the verification link.",
      };
    }
    return {
      success: false,
      error: error.message,
    };
  }

  // Update last_seen_at
  if (data.user) {
    await (supabase
      .from("profiles") as any)
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", data.user.id);
  }

  return {
    success: true,
    redirectTo: redirectTo || "/dashboard",
  };
}

// =============================================================================
// SIGN OUT
// =============================================================================

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// =============================================================================
// OAUTH SIGN IN
// =============================================================================

export async function signInWithOAuth(
  provider: "github" | "google",
  redirectTo?: string
): Promise<{ url: string } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo || "/dashboard")}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: `${origin}/auth/callback?next=${redirectTo || "/dashboard"}`,
      queryParams: provider === "google" ? {
        access_type: "offline",
        prompt: "consent",
      } : undefined,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.url) {
    return { error: "No OAuth URL returned" };
  }

  return { url: data.url };
}
// =============================================================================
// PASSWORD RESET
// =============================================================================

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?type=recovery`,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "If an account exists with this email, you will receive a password reset link.",
  };
}

export async function resetPassword(newPassword: string): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Password updated successfully!",
    redirectTo: "/dashboard",
  };
}

// =============================================================================
// RESEND VERIFICATION EMAIL
// =============================================================================

export async function resendVerificationEmail(email: string): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?type=signup`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Verification email sent! Please check your inbox.",
  };
}

// =============================================================================
// GET CURRENT USER
// =============================================================================

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
