import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for use in API routes and Server Components.
 * Uses the service role key for elevated permissions.
 */
export function createServerClient() {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    console.log("[supabase] Initialized with URL:", process.env.SUPABASE_URL ? "Integration URL" : "Manual NEXT_PUBLIC_ URL");

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
        db: { schema: "public" },
    });
}
