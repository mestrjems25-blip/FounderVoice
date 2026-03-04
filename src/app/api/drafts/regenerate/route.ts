import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";

// ─── PREMIUM UPGRADE (Anthropic Claude Opus — adaptive thinking) ─────────────
// import Anthropic from "@anthropic-ai/sdk";
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// ─────────────────────────────────────────────────────────────────────────────

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MOCK_MODE = process.env.MOCK_MODE === "true";

const MOCK_REGEN =
    "Scaling in 2026 isn't about more people. It's about better leverage. We hit $1M ARR with 2 people and a fleet of AI agents. Stop hiring. Start automating.";

function getGroq() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("[regenerate] GROQ_API_KEY not set");
    return new Groq({ apiKey });
}

async function callGroq(messages: Groq.Chat.ChatCompletionMessageParam[], maxRetries = 2): Promise<string> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const groq = getGroq();
            const completion = await groq.chat.completions.create({
                model: GROQ_MODEL,
                messages,
                temperature: 0.7,
                max_tokens: 1024,
            });
            return completion.choices[0]?.message?.content?.trim() ?? "";
        } catch (err) {
            const is429 =
                (err as { status?: number }).status === 429 ||
                String(err).includes("429") ||
                String(err).includes("rate_limit");
            if (is429 && attempt < maxRetries) {
                const delay = attempt === 0 ? 5000 : 10000;
                await new Promise<void>((r) => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }
    throw new Error("[regenerate] callGroq: exhausted retries");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const sessionSupabase = await createSessionClient();
    const {
        data: { user },
    } = await sessionSupabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { draftId, instruction } = (await request.json()) as {
        draftId: string;
        instruction: string;
    };

    if (!draftId || !instruction) {
        return NextResponse.json({ error: "Missing draftId or instruction" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: draft } = await supabase
        .from("drafts")
        .select("raw_transcript, variation_type")
        .eq("id", draftId)
        .eq("user_id", user.id)
        .single();

    if (!draft) {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    let aiOutput: string;

    if (MOCK_MODE) {
        await new Promise<void>((r) => setTimeout(r, 1500));
        aiOutput = MOCK_REGEN;
    } else {
        const { data: profile } = await supabase
            .from("profiles")
            .select("voice_style, voice_dna, context_vault")
            .eq("id", user.id)
            .single();

        const voiceStyle = (profile?.voice_style ?? {}) as Record<string, unknown>;
        const voiceDna = (profile?.voice_dna as string | undefined) ?? "";
        const contextVault = (profile?.context_vault as string | undefined) ?? "";

        const toneClause = voiceStyle.tone ? `\nTone: ${voiceStyle.tone}.` : "";
        const dnaBlock = voiceDna ? `\n\n[PERSONALITY CONSTRAINTS]\n${voiceDna}` : "";
        const contextBlock = contextVault ? `\n\n[COMPANY CONTEXT]\n${contextVault}` : "";

        const systemPrompt = `You are a ghostwriter. Output ONLY the rewritten post — the very first character must be the start of the post body. No preamble, no meta-talk, no commentary.

VOICE RULES (non-negotiable):
- Write like a founder talking to a friend over coffee: direct, slightly tired, but sharp.
- Never use LinkedIn-isms: no rocket emojis (🚀), no "In today's fast-paced world", no "I'm excited to share", no "game-changer", no "tapestry", "delve", "leverage", "unleash", "empower", "groundbreaking", "innovative", "revolutionize", "seamlessly", "holistic", "synergy", "paradigm", "ecosystem".
- No titles, no headers, no bold text, no hashtags.
- Single line breaks between ideas — no double-spacing between every sentence.
- Post body starts immediately. No intro sentence like "Here's a rewrite" or "Certainly!".${toneClause}${dnaBlock}${contextBlock}`;

        const userMessage = `Rewrite instruction: ${instruction}\n\nOriginal transcript:\n${draft.raw_transcript}\n\nReturn ONLY the plain rewritten post.`;

        try {
            aiOutput = await callGroq([
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ]);
            console.log("[regenerate] Groq succeeded — draftId:", draftId);
        } catch (err) {
            console.error("[regenerate] Groq failed:", err);
            return NextResponse.json({ error: "AI regeneration failed" }, { status: 500 });
        }
    }

    await supabase
        .from("drafts")
        .update({ ai_output: aiOutput, status: "pending", updated_at: new Date().toISOString() })
        .eq("id", draftId)
        .eq("user_id", user.id);

    return NextResponse.json({ aiOutput });
}
