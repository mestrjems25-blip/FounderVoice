import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/session";
import { getConnectedPlatforms } from "@/lib/social/client";

export async function GET(): Promise<NextResponse> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.UPLOAD_POST_API_KEY) {
        return NextResponse.json({ linkedin: false, x: false });
    }

    const status = await getConnectedPlatforms(user.id).catch(() => ({ linkedin: false, x: false }));
    return NextResponse.json(status);
}
