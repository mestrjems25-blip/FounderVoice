import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@/lib/supabase/server";

// ─── PREMIUM UPGRADE (Anthropic Claude Opus) ────────────────────────────────
// import Anthropic from "@anthropic-ai/sdk";
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_MODE = process.env.MOCK_MODE === "true";

const GEMINI_MODEL = "gemini-1.5-flash";

function getGenAI() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
    console.log("[Gemini Init] Key found:", !!apiKey, "| length:", apiKey?.length ?? 0);
    if (!apiKey) throw new Error("[processor] Gemini API key not set — check GOOGLE_GENERATIVE_AI_API_KEY in Vercel");
    return new GoogleGenAI({ apiKey });
}

async function callGemini(
    contents: Parameters<ReturnType<typeof getGenAI>["models"]["generateContent"]>[0]["contents"],
    maxRetries = 2
): Promise<string> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await getGenAI().models.generateContent({ model: GEMINI_MODEL, contents });
            return result.text ?? "";
        } catch (err) {
            const is429 =
                (err as { status?: number }).status === 429 ||
                String(err).includes("429") ||
                String(err).includes("RESOURCE_EXHAUSTED");
            if (is429 && attempt < maxRetries) {
                const delay = 10000 * (attempt + 1);
                console.warn(`[processor] Gemini 429 — retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise<void>((r) => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }
    throw new Error("callGemini: exhausted retries");
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
        ? "The founder sent an image. Analyze what you see — data, context, insights, and emotion. Transform it into 3 LinkedIn post variations."
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
        // const userContent = imageUrl
        //     ? [
        //           { type: "image" as const, source: { type: "url" as const, url: imageUrl } },
        //           { type: "text" as const, text: buildPrompt(voiceStyle, transcript, voiceDna, contextVault, true) },
        //       ]
        //     : buildPrompt(voiceStyle, transcript, voiceDna, contextVault);
        //
        // const response = await anthropic.messages.create({
        //     model: "claude-opus-4-6",
        //     max_tokens: 2048,
        //     thinking: { type: "adaptive" },
        //     system: "You are a world-class LinkedIn ghostwriter.",
        //     messages: [{ role: "user", content: userContent }],
        // });
        // const textBlock = response.content.find((b) => b.type === "text");
        // if (!textBlock || textBlock.type !== "text") throw new Error("No text block in Anthropic response");
        // const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
        // variations = JSON.parse(jsonMatch?.[0] ?? textBlock.text) as PostVariations;
        // ─────────────────────────────────────────────────────────────────────────

        console.log("[processor] Processing with Gemini — userId:", userId, "imageUrl:", imageUrl ?? "none");

        const genai = getGenAI();
        const contents: Parameters<typeof genai.models.generateContent>[0]["contents"] = imageUrl
            ? [
                  {
                      role: "user" as const,
                      parts: [
                          { inlineData: { mimeType: "image/jpeg", data: await urlToBase64(imageUrl) } },
                          { text: buildPrompt(voiceStyle, transcript, voiceDna, contextVault, true) },
                      ],
                  },
              ]
            : buildPrompt(voiceStyle, transcript, voiceDna, contextVault);

        try {
            const raw = await callGemini(contents);
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            variations = JSON.parse(jsonMatch?.[0] ?? raw) as PostVariations;
            console.log("[processor] Gemini response parsed successfully");
        } catch (err) {
            console.error("[processor] Gemini failed after retries — saving raw transcript fallback:", err);
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
        // ─── PREMIUM UPGRADE (Anthropic) ─────────────────────────────────────────
        // const response = await anthropic.messages.create({
        //     model: "claude-opus-4-6",
        //     max_tokens: 1024,
        //     thinking: { type: "adaptive" },
        //     system: buildPrompt(voiceStyle, transcript, voiceDna, contextVault),
        //     messages: [{ role: "user", content: `Rewrite as "${variationType}". Instruction: ${instruction}\n\nReturn only the plain post text — no JSON.` }],
        // });
        // const textBlock = response.content.find((b) => b.type === "text");
        // if (!textBlock || textBlock.type !== "text") throw new Error("No text block in Anthropic response");
        // aiOutput = textBlock.text.trim();
        // ─────────────────────────────────────────────────────────────────────────

        console.log("[processor] generateVariation with Gemini — userId:", userId, "type:", variationType);

        const prompt = `${buildPrompt(voiceStyle, transcript, voiceDna, contextVault)}\n\nRewrite this transcript specifically as the "${variationType}" variation, applying this instruction: ${instruction}\n\nReturn ONLY the plain text of the post — no JSON, no labels.`;

        try {
            aiOutput = (await callGemini(prompt)).trim();
            console.log("[processor] generateVariation succeeded");
        } catch (err) {
            console.error("[processor] generateVariation Gemini failed:", err);
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

async function urlToBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return Buffer.from(buf).toString("base64");
}
