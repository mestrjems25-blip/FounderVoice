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
    const key = process.env.UPLOAD_POST_API_KEY?.trim();
    if (!key) throw new Error("[social] UPLOAD_POST_API_KEY not set");
    console.log("[social] key prefix:", key.slice(0, 7), "| length:", key.length);
    return key;
}

// Probe once at startup to find which auth scheme Upload-Post accepts.
// Tries ApiKey → Apikey → Bearer and caches the winner for the process lifetime.
let resolvedScheme: string | null = null;

async function probeAuthScheme(username: string): Promise<string> {
    if (resolvedScheme) return resolvedScheme;

    const key = apiKey();
    const schemes = ["ApiKey", "Apikey", "Bearer"];

    for (const scheme of schemes) {
        console.log("[social] probing scheme:", scheme);
        const res = await fetch(`${BASE}/uploadposts/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${scheme} ${key}`,
            },
            body: JSON.stringify({ username }),
        });
        // 200 (created) or 409 (exists) both mean auth passed
        if (res.ok || res.status === 409) {
            console.log("[social] auth scheme resolved:", scheme);
            resolvedScheme = scheme;
            return scheme;
        }
        console.log("[social] scheme", scheme, "→", res.status);
    }

    throw new Error("[social] all auth schemes rejected by Upload-Post (401)");
}

function authHeader(scheme: string): HeadersInit {
    return {
        "Content-Type": "application/json",
        Authorization: `${scheme} ${apiKey()}`,
    };
}

// Derive a stable Upload-Post username from the Supabase user ID.
// Upload-Post usernames must be alphanumeric — strip hyphens from UUID.
export function toUpUsername(userId: string): string {
    return userId.replace(/-/g, "");
}

// Create an Upload-Post profile for this user. Safe to call multiple times —
// ignores "already exists" (409) responses. Also resolves the correct auth scheme.
export async function ensureProfile(userId: string): Promise<void> {
    const username = toUpUsername(userId);
    await probeAuthScheme(username);
    // probeAuthScheme already created/confirmed the user as a side-effect
}

// Generate an OAuth access_url for the user to connect social accounts.
// Returns the URL to redirect the user to.
export async function generateOAuthUrl(
    userId: string,
    platforms: SocialPlatform[],
    redirectUrl: string
): Promise<string> {
    const username = toUpUsername(userId);

    // Step 1: guarantee user exists and resolve the working auth scheme
    console.log("[social] ensureProfile →", username);
    await ensureProfile(userId);
    console.log("[social] ensureProfile ✓ scheme:", resolvedScheme);

    // Step 2: generate the OAuth access URL
    console.log("[social] generate-jwt →", { username, platforms });
    const res = await fetch(`${BASE}/uploadposts/users/generate-jwt`, {
        method: "POST",
        headers: authHeader(resolvedScheme!),
        body: JSON.stringify({ username, redirect_url: redirectUrl, platforms }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`[social] generate-jwt failed: ${res.status} ${text}`);
    }

    const data = await res.json() as { access_url: string };
    console.log("[social] generate-jwt ✓ →", data.access_url.slice(0, 60) + "…");
    return data.access_url;
}

// Fetch the user's Upload-Post profile to see which platforms are connected.
export async function getConnectedPlatforms(userId: string): Promise<ConnectedPlatforms> {
    const username = toUpUsername(userId);
    try {
        const res = await fetch(`${BASE}/uploadposts/users/${username}`, {
            headers: { Authorization: `${resolvedScheme ?? "ApiKey"} ${apiKey()}` },
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

// Strip AI preamble and meta-talk from a post before sending to social platforms.
// Handles patterns like "Here's a post:", separator lines, and blank preambles.
export function cleanPostText(text: string): string {
    const lines = text.split("\n");
    let startIdx = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip blank lines and separator lines
        if (!line || /^[-_=*]{3,}$/.test(line)) {
            startIdx = i + 1;
            continue;
        }
        // Skip short meta-label lines ending with ":" e.g. "Here's a post:" / "Post:"
        if (i === startIdx && line.length < 80 && line.endsWith(":") && !line.includes("\n")) {
            startIdx = i + 1;
            continue;
        }
        break;
    }

    return lines.slice(startIdx).join("\n").trimEnd();
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
            { headers: { Authorization: `${resolvedScheme ?? "ApiKey"} ${apiKey()}` } }
        );
        if (!res.ok) return {};
        const data = await res.json() as Record<string, PlatformAnalytics>;
        return data as AnalyticsResult;
    } catch {
        return {};
    }
}
