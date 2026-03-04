import Groq from "groq-sdk";
import { createServerClient } from "@/lib/supabase/server";

// ─── PREMIUM UPGRADE (Anthropic Claude Opus) ────────────────────────────────
// import Anthropic from "@anthropic-ai/sdk";
// ─────────────────────────────────────────────────────────────────────────────

// ─── PREMIUM UPGRADE (Google Gemini) ────────────────────────────────────────
// import { GoogleGenAI } from "@google/genai";
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_MODE = process.env.MOCK_MODE === "true";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Escape literal control characters inside JSON string values so JSON.parse doesn't choke
function sanitizeJsonString(raw: string): string {
    let inString = false;
    let escaped = false;
    let result = "";
    for (const char of raw) {
        if (escaped) {
            result += char;
            escaped = false;
        } else if (char === "\\" && inString) {
            result += char;
            escaped = true;
        } else if (char === '"') {
            result += char;
            inString = !inString;
        } else if (inString) {
            const code = char.charCodeAt(0);
            if (char === "\n") result += "\\n";
            else if (char === "\r") result += "\\r";
            else if (char === "\t") result += "\\t";
            else if (code < 32) { /* skip other control chars */ }
            else result += char;
        } else {
            result += char;
        }
    }
    return result;
}

function getGroq() {
    const apiKey = process.env.GROQ_API_KEY;
    console.log("[Groq Init] Key found:", !!apiKey, "| length:", apiKey?.length ?? 0);
    if (!apiKey) throw new Error("[processor] GROQ_API_KEY not set — check Vercel env vars");
    return new Groq({ apiKey });
}

async function callGroq(prompt: string, maxRetries = 2): Promise<string> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const groq = getGroq();
            const completion = await groq.chat.completions.create({
                model: GROQ_MODEL,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 1024,
            });
            return completion.choices[0]?.message?.content ?? "";
        } catch (err) {
            const is429 =
                (err as { status?: number }).status === 429 ||
                String(err).includes("429") ||
                String(err).includes("rate_limit");
            if (is429 && attempt < maxRetries) {
                const delay = attempt === 0 ? 5000 : 10000;
                console.warn(`[processor] Groq 429 — retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise<void>((r) => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }
    throw new Error("callGroq: exhausted retries");
}

interface VoiceStyle {
    tone?: string;
    formatting?: string;
    signature?: string;
    avoidWords?: string[];
}

export interface PostVariations {
    brutal: string;
    x_factor: string;
    deep_dive: string;
}

const MOCK_VARIATIONS: PostVariations = {
    brutal: "Scaling in 2026 isn't about more people. It's about better leverage. Stop hiring, start automating.",
    x_factor: `The headcount trap is real. Here's how we hit $100k MRR with just 2 people and a fleet of AI agents:\n\n→ One engineer replaced three support staff overnight using a $20/month LLM.\n→ Our onboarding flow is 100% automated — customers self-serve in under 8 minutes.\n→ We run weekly "automation sprints": one day to eliminate one manual process.\n→ The result: 12-month ARR growth of 3x with zero new hires.\n\nThe companies winning in 2026 aren't the ones with the biggest teams. They're the ones who figured out which humans to keep.`,
    deep_dive: `Slide 1: The New Math of SaaS: Revenue ÷ Headcount.\nSlide 2: We replaced 3 support staff with a $20/month AI.\nSlide 3: 100% automated onboarding. 8 minutes to value.\nSlide 4: One "automation sprint" per week. One less manual task.\nSlide 5: Stop hiring. Start automating. Build the leverage machine.`,
};

const FORMAT_INSTRUCTIONS: Record<string, string> = {
    "bullet-points": "Favor bullet-pointed listicles over narrative prose.",
    "story": "Prioritize narrative story structure — hook, conflict, resolution, lesson.",
    "listicle": "Lead with a numbered list framework. Each post variation should feel scannable.",
    "thread": "Structure content as punchy, standalone statements. Think numbered micro-insights.",
};

function buildPrompt(
    style: VoiceStyle,
    transcript: string,
    voiceDna?: string,
    contextVault?: string,
    isImage?: boolean
): string {
    const toneClause = style.tone ? `\nTone target: ${style.tone}.` : "";
    const formatClause = style.formatting
        ? `\nFormat preference: ${FORMAT_INSTRUCTIONS[style.formatting] ?? style.formatting}`
        : "";
    const signatureClause = style.signature
        ? `\nClose each post with: "${style.signature}"`
        : "";

    const contextBlock = contextVault?.trim()
        ? `\n\n[COMPANY CONTEXT]\nUse the following business context to make posts specific and accurate:\n${contextVault.trim()}`
        : "";

    const dnaBlock = voiceDna?.trim()
        ? `\n\n[STRICT PERSONALITY CONSTRAINTS]\n${voiceDna.trim()}`
        : "";

    const forbiddenBlock = style.avoidWords?.length
        ? `\n\n[FORBIDDEN VOCABULARY]\nNever use any of these words or phrases:\n${style.avoidWords.map((w) => `- ${w}`).join("\n")}`
        : "";

    const inputDescription = isImage
        ? "The founder shared an image with context below. Transform the context into 3 LinkedIn post variations."
        : `Transform this voice memo transcript into 3 LinkedIn post variations:\n\n${transcript}`;

    return `LinkedIn ghostwriter for founders. No jargon, no hashtags, no fluff. Voice DNA overrides everything.${toneClause}${formatClause}${signatureClause}${contextBlock}${dnaBlock}${forbiddenBlock}

Return ONLY valid JSON — no markdown, no explanation:
{"brutal":"...","x_factor":"...","deep_dive":"..."}

brutal: 3–5 punchy sentences, sharpest insight first, max 150 words.
x_factor: hook + 3–5 bullet points using →, concrete specifics, strong close, max 300 words.
deep_dive: 5-slide carousel. "Slide 1: [text]\nSlide 2: [text]" etc. Max 15 words per slide.

${inputDescription}`;
}

export async function processTranscript(
    userId: string,
    transcript: string,
    sourceAudioUrl: string | null,
    imageUrl?: string
): Promise<PostVariations> {
    const supabase = createServerClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("voice_style, voice_dna, context_vault")
        .eq("id", userId)
        .single();

    const voiceStyle: VoiceStyle = (profile?.voice_style as VoiceStyle) ?? {};
    const voiceDna: string | undefined = profile?.voice_dna ?? undefined;
    const contextVault: string | undefined = profile?.context_vault ?? undefined;

    let variations: PostVariations;

    if (MOCK_MODE) {
        await new Promise<void>((resolve) => setTimeout(resolve, 3000));
        variations = MOCK_VARIATIONS;
    } else {
        // ─── PREMIUM UPGRADE (Anthropic — adaptive thinking, superior quality) ───
        // const response = await anthropic.messages.create({ model: "claude-opus-4-6", ... });
        // ─────────────────────────────────────────────────────────────────────────

        console.log("[processor] Processing with Groq — userId:", userId, "imageUrl:", imageUrl ?? "none");

        const prompt = buildPrompt(voiceStyle, transcript, voiceDna, contextVault, !!imageUrl);

        try {
            const raw = await callGroq(prompt);
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            variations = JSON.parse(sanitizeJsonString(jsonMatch?.[0] ?? raw)) as PostVariations;
            console.log("[processor] Groq response parsed successfully");
        } catch (err) {
            console.error("[processor] Groq failed after retries — saving raw transcript fallback:", err);
            const fallback = `[AI processing queued — edit this draft with your own words]\n\n${transcript}`;
            variations = { brutal: fallback, x_factor: fallback, deep_dive: fallback };
        }
    }

    console.log("[processor] Inserting 3 drafts into DB — userId:", userId);
    const { error: insertError } = await supabase.from("drafts").insert([
        {
            user_id: userId,
            raw_transcript: transcript,
            ai_output: variations.brutal,
            variation_type: "brutal",
            source_audio_url: sourceAudioUrl,
            source_image_url: imageUrl ?? null,
            status: "pending",
        },
        {
            user_id: userId,
            raw_transcript: transcript,
            ai_output: variations.x_factor,
            variation_type: "x_factor",
            source_audio_url: sourceAudioUrl,
            source_image_url: imageUrl ?? null,
            status: "pending",
        },
        {
            user_id: userId,
            raw_transcript: transcript,
            ai_output: variations.deep_dive,
            variation_type: "deep_dive",
            source_audio_url: sourceAudioUrl,
            source_image_url: imageUrl ?? null,
            status: "pending",
        },
    ]);

    if (insertError) {
        console.error("[processor] drafts insert FAILED:", insertError.code, insertError.message, insertError.details);
        throw insertError;
    }
    console.log("[processor] 3 drafts inserted successfully");

    return variations;
}

export async function generateVariation(
    userId: string,
    transcript: string,
    variationType: string,
    sourceAudioUrl: string | null,
    instruction: string
): Promise<{ id: string; aiOutput: string }> {
    const supabase = createServerClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("voice_style, voice_dna, context_vault")
        .eq("id", userId)
        .single();

    const voiceStyle: VoiceStyle = (profile?.voice_style as VoiceStyle) ?? {};
    const voiceDna: string | undefined = profile?.voice_dna ?? undefined;
    const contextVault: string | undefined = profile?.context_vault ?? undefined;

    let aiOutput: string;

    if (MOCK_MODE) {
        await new Promise<void>((resolve) => setTimeout(resolve, 2000));
        aiOutput = MOCK_VARIATIONS[variationType as keyof PostVariations] ?? MOCK_VARIATIONS.brutal;
    } else {
        console.log("[processor] generateVariation with Groq — userId:", userId, "type:", variationType);

        const prompt = `${buildPrompt(voiceStyle, transcript, voiceDna, contextVault)}\n\nRewrite this transcript specifically as the "${variationType}" variation, applying this instruction: ${instruction}\n\nReturn ONLY the plain text of the post — no JSON, no labels.`;

        try {
            aiOutput = (await callGroq(prompt)).trim();
            console.log("[processor] generateVariation succeeded");
        } catch (err) {
            console.error("[processor] generateVariation Groq failed:", err);
            throw err;
        }
    }

    const { data: newDraft, error } = await supabase
        .from("drafts")
        .insert({
            user_id: userId,
            raw_transcript: transcript,
            ai_output: aiOutput,
            variation_type: variationType,
            source_audio_url: sourceAudioUrl,
            status: "pending",
        })
        .select("id")
        .single();

    if (!newDraft || error) throw new Error("Failed to save variation draft");

    return { id: newDraft.id, aiOutput };
}
