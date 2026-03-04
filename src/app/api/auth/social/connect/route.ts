import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/session";
import { generateOAuthUrl, type SocialPlatform } from "@/lib/social/client";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        return NextResponse.redirect(`${baseUrl}/auth/signin`);
    }

    const { searchParams } = request.nextUrl;
    const platformParam = searchParams.get("platforms") ?? "linkedin,x";
    const platforms = platformParam.split(",").filter((p): p is SocialPlatform =>
        p === "linkedin" || p === "x"
    );

    if (!platforms.length) {
        return NextResponse.json({ error: "No valid platforms specified" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const redirectUrl = `${baseUrl}/api/auth/social/callback`;

    try {
        const accessUrl = await generateOAuthUrl(user.id, platforms, redirectUrl);
        return NextResponse.redirect(accessUrl);
    } catch (err) {
        console.error("[social/connect]", err);
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?social=error`);
    }
}
