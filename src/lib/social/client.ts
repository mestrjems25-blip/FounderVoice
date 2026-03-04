import { UploadPost } from "upload-post";

const BASE = "https://api.upload-post.com/api";

export type SocialPlatform = "x" | "linkedin";

export interface ConnectedPlatforms {
    x: boolean;
    linkedin: boolean;
}

export interface SocialPost {
    id: string;
    status: string;
}

export interface PlatformAnalytics {
    followers?: number;
    impressions?: number;
    reach?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    reposts?: number;
}

export type AnalyticsResult = Partial<Record<SocialPlatform, PlatformAnalytics>>;

function apiKey(): string {
    const key = process.env.UPLOAD_POST_API_KEY;
    if (!key) throw new Error("[social] UPLOAD_POST_API_KEY not set");
    return key;
}

function authHeaders(): HeadersInit {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey()}`,
    };
}

// Derive a stable Upload-Post username from the Supabase user ID.
// Upload-Post usernames must be alphanumeric — strip hyphens from UUID.
export function toUpUsername(userId: string): string {
    return userId.replace(/-/g, "");
}

// Create an Upload-Post profile for this user. Safe to call multiple times —
// ignores "already exists" errors.
export async function ensureProfile(userId: string): Promise<void> {
    const username = toUpUsername(userId);
    const res = await fetch(`${BASE}/uploadposts/users`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ username }),
    });
    if (!res.ok && res.status !== 409) {
        const text = await res.text();
        console.error("[social] ensureProfile failed:", res.status, text);
    }
}

// Generate an OAuth access_url for the user to connect social accounts.
// Returns the URL to redirect the user to.
export async function generateOAuthUrl(
    userId: string,
    platforms: SocialPlatform[],
    redirectUrl: string
): Promise<string> {
    const username = toUpUsername(userId);
    await ensureProfile(userId);

    const res = await fetch(`${BASE}/uploadposts/users/generate-jwt`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ username, redirect_url: redirectUrl, platforms }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`[social] generate-jwt failed: ${res.status} ${text}`);
    }

    const data = await res.json() as { access_url: string };
    return data.access_url;
}

// Fetch the user's Upload-Post profile to see which platforms are connected.
export async function getConnectedPlatforms(userId: string): Promise<ConnectedPlatforms> {
    const username = toUpUsername(userId);
    try {
        const res = await fetch(`${BASE}/uploadposts/users/${username}`, {
            headers: { Authorization: `Bearer ${apiKey()}` },
        });
        if (!res.ok) return { x: false, linkedin: false };
        const data = await res.json() as { profile?: { connected_platforms?: string[] } };
        const connected = data.profile?.connected_platforms ?? [];
        return {
            x: connected.includes("x"),
            linkedin: connected.includes("linkedin"),
        };
    } catch {
        return { x: false, linkedin: false };
    }
}

// Publish a text post to LinkedIn and/or X via Upload-Post SDK.
export async function postText(
    userId: string,
    text: string,
    platforms: SocialPlatform[],
    scheduledAt?: string
): Promise<SocialPost> {
    const key = apiKey();
    const uploader = new UploadPost(key);
    const username = toUpUsername(userId);

    const result = await uploader.uploadText({
        user: username,
        platforms,
        title: text,
        ...(scheduledAt ? { scheduled_date: scheduledAt } : {}),
    } as Parameters<typeof uploader.uploadText>[0]);

    const r = result as { id?: string; status?: string };
    return { id: r.id ?? "", status: r.status ?? "queued" };
}

// Fetch account-level analytics for the user's connected platforms.
export async function getAnalytics(
    userId: string,
    platforms: SocialPlatform[]
): Promise<AnalyticsResult> {
    const username = toUpUsername(userId);
    const platformStr = platforms.join(",");

    try {
        const res = await fetch(
            `${BASE}/analytics/${username}?platforms=${platformStr}`,
            { headers: { Authorization: `Bearer ${apiKey()}` } }
        );
        if (!res.ok) return {};
        const data = await res.json() as Record<string, PlatformAnalytics>;
        return data as AnalyticsResult;
    } catch {
        return {};
    }
}
