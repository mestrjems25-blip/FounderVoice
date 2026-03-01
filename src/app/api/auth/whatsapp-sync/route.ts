import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest): Promise<NextResponse> {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
        return NextResponse.redirect(`${APP_URL}/?error=missing_token`);
    }

    const supabase = createServerClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, whatsapp_sync_expires_at")
        .eq("whatsapp_sync_token", token)
        .single();

    if (!profile) {
        return NextResponse.redirect(`${APP_URL}/?error=invalid_token`);
    }

    const expired = profile.whatsapp_sync_expires_at
        ? new Date(profile.whatsapp_sync_expires_at) < new Date()
        : true;

    if (expired) {
        return NextResponse.redirect(`${APP_URL}/?error=expired_token`);
    }

    // Fetch the auth user to get their email
    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
    if (!authUser?.user?.email) {
        return NextResponse.redirect(`${APP_URL}/?error=user_not_found`);
    }

    // Generate a magic link — Supabase handles the session creation
    const { data: linkData } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: authUser.user.email,
        options: { redirectTo: `${APP_URL}/dashboard` },
    });

    // Invalidate the sync token immediately (one-time use)
    await supabase
        .from("profiles")
        .update({ whatsapp_sync_token: null, whatsapp_sync_expires_at: null })
        .eq("id", profile.id);

    const magicLink = linkData?.properties?.action_link;
    if (!magicLink) {
        return NextResponse.redirect(`${APP_URL}/?error=link_generation_failed`);
    }

    // Check if this is a new profile (no full_name set = first time setup)
    const { data: fullProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", profile.id)
        .single();

    const redirectAfterAuth = fullProfile?.full_name
        ? `${APP_URL}/dashboard`
        : `${APP_URL}/dashboard/voice-profile`;

    // Replace Supabase's redirect with ours
    const finalLink = magicLink.replace(
        encodeURIComponent(`${APP_URL}/dashboard`),
        encodeURIComponent(redirectAfterAuth)
    );

    return NextResponse.redirect(finalLink);
}
