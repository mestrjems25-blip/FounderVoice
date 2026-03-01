import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/session";
import { getChannels, createPost, createThread } from "@/lib/buffer/client";

function parseThread(text: string): string[] {
    const lines = text.split("\n");
    const tweets: string[] = [];
    let current = "";
    for (const line of lines) {
        if (/^\d+[/.]\s/.test(line.trim())) {
            if (current.trim()) tweets.push(current.trim());
            current = line;
        } else {
            current += (current ? "\n" : "") + line;
        }
    }
    if (current.trim()) tweets.push(current.trim());
    return tweets.length > 1 ? tweets : [text];
}

// When set, posts go to these exact Buffer channel IDs without a dynamic lookup.
// Set these to your test/demo account channels for safe demos.
// A buyer sets them to their own channel IDs from their Buffer dashboard.
const PINNED: Partial<Record<"linkedin" | "twitter", string | undefined>> = {
    linkedin: process.env.BUFFER_LINKEDIN_CHANNEL_ID,
    twitter: process.env.BUFFER_TWITTER_CHANNEL_ID,
};

export async function GET(): Promise<NextResponse> {
    try {
        const supabase = await createSessionClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const channels = await getChannels();
        console.log(
            "[buffer/channels]",
            channels.map((c) => `${c.name} (${c.service}): ${c.id}`).join("\n")
        );
        return NextResponse.json({ channels });
    } catch (err) {
        console.error("[buffer/channels]", err);
        return NextResponse.json({ error: "Failed to fetch Buffer channels" }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const supabase = await createSessionClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { text, channelId: providedChannelId, draftId, platform = "linkedin", scheduledAt } = await request.json() as {
            text?: string;
            channelId?: string;
            draftId?: string;
            platform?: "linkedin" | "twitter";
            scheduledAt?: string;
        };

        let postText = text;

        if (!postText?.trim() && draftId) {
            const { data: draft } = await supabase
                .from("drafts")
                .select("ai_output")
                .eq("id", draftId)
                .eq("user_id", user.id)
                .single();
            if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });
            postText = draft.ai_output;
        }

        if (!postText?.trim()) {
            return NextResponse.json({ error: "No content to publish" }, { status: 400 });
        }

        let channelId = providedChannelId ?? PINNED[platform];
        if (!channelId) {
            const channels = await getChannels();
            const service = platform === "twitter" ? "twitter" : "linkedin";
            const target = channels.find((c) => c.service === service) ?? channels[0];
            if (!target) return NextResponse.json({ error: "No Buffer channels connected" }, { status: 400 });
            console.log(`[buffer/publish] auto-selected channel: ${target.name} (${target.service}: ${target.id})`);
            channelId = target.id;
        } else {
            console.log(`[buffer/publish] pinned channel: ${channelId} (${platform})`);
        }

        let post;
        if (platform === "twitter") {
            const tweets = parseThread(postText);
            post = tweets.length > 1
                ? await createThread(channelId, tweets, scheduledAt)
                : await createPost(channelId, postText, scheduledAt);
        } else {
            post = await createPost(channelId, postText, scheduledAt);
        }

        if (draftId) {
            await supabase
                .from("drafts")
                .update({
                    status: scheduledAt ? "scheduled" : "published",
                    scheduled_at: scheduledAt ?? null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", draftId)
                .eq("user_id", user.id);
        }

        return NextResponse.json({ success: true, post });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[buffer/publish]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
