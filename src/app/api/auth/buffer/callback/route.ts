import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    if (error || !code || !state) {
        console.error("[buffer/callback] OAuth error or missing params:", error);
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?buffer=error`);
    }

    let userId: string;
    try {
        userId = Buffer.from(state, "base64url").toString("utf8");
        if (!/^[0-9a-f-]{36}$/.test(userId)) throw new Error("Invalid state");
    } catch {
        console.error("[buffer/callback] Invalid state param");
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?buffer=error`);
    }

    const clientId = process.env.BUFFER_CLIENT_ID!;
    const clientSecret = process.env.BUFFER_CLIENT_SECRET!;
    const redirectUri = `${baseUrl}/api/auth/buffer/callback`;

    const tokenRes = await fetch("https://api.bufferapp.com/1/oauth2/token.json", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code,
            grant_type: "authorization_code",
        }),
    });

    if (!tokenRes.ok) {
        console.error("[buffer/callback] Token exchange failed:", tokenRes.status, await tokenRes.text());
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?buffer=error`);
    }

    const { access_token } = await tokenRes.json() as { access_token: string };
    if (!access_token) {
        console.error("[buffer/callback] No access_token in response");
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?buffer=error`);
    }

    const supabase = createServerClient();
    await supabase
        .from("profiles")
        .update({ buffer_access_token: access_token, updated_at: new Date().toISOString() })
        .eq("id", userId);

    console.log("[buffer/callback] Buffer connected for userId:", userId);
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?buffer=connected`);
}
