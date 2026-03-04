import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/session";

export async function GET(): Promise<NextResponse> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL("/auth/signin", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
    }

    const clientId = process.env.BUFFER_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ error: "BUFFER_CLIENT_ID not configured" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const redirectUri = `${baseUrl}/api/auth/buffer/callback`;
    const state = Buffer.from(user.id).toString("base64url");

    const authUrl = new URL("https://bufferapp.com/oauth2/authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", state);

    return NextResponse.redirect(authUrl.toString());
}
