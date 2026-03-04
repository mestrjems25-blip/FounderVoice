import { NextRequest, NextResponse } from "next/server";

// Upload-Post handles the full OAuth handshake internally.
// After the user connects their accounts, Upload-Post redirects here.
// We just send the user back to settings with a status param.
export async function GET(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = request.nextUrl;
    const error = searchParams.get("error");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    if (error) {
        console.error("[social/callback] OAuth error:", error);
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?social=error`);
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/settings?social=connected`);
}
