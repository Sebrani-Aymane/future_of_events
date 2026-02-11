import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database";

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        // If no profile exists (new OAuth user), create one
        if (!profile) {
          const fullName = user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User";

          const newProfile: ProfileInsert = {
            id: user.id,
            email: user.email!,
            full_name: fullName,
            avatar_url: user.user_metadata?.avatar_url || null,
            github_username: user.user_metadata?.user_name || null,
            role: "participant",
          };

          await supabase.from("profiles").insert(newProfile);

          return NextResponse.redirect(`${origin}/dashboard?setup=true`);
        }
      }

      // Handle password recovery
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Handle email verification
      if (type === "signup" || type === "email_change") {
        return NextResponse.redirect(`${origin}/dashboard?verified=true`);
      }

      // Default redirect
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // OAuth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
