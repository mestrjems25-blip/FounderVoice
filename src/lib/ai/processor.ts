import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@/lib/supabase/server";

// ─── PREMIUM UPGRADE (Anthropic Claude Opus) ────────────────────────────────
// import Anthropic from "@anthropic-ai/sdk";
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// ─────────────────────────────────────────────────────────────────────────────

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY! });

const MOCK_MODE = process.env.MOCK_MODE === "true";

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

    return `You are an AI twin of a specific founder. You must never use corporate jargon. If the Voice DNA below contradicts your default style, the Voice DNA wins 100% of the time.

You are a world-class LinkedIn ghostwriter for high-performing founders. Your job is to take raw, unedited voice memo transcripts and transform them into polished, high-engagement LinkedIn content that sounds exactly like the founder wrote it themselves — specific, direct, and human. No fluff. No corporate speak. No hashtags. No exclamation marks unless the founder uses them naturally.
${toneClause}${formatClause}${signatureClause}

Return ONLY valid JSON with this exact structure — no markdown fences, no explanation, just the JSON object:
{
  "brutal": "...",
  "x_factor": "...",
  "deep_dive": "..."
}

Format rules:
- brutal: 3–5 punchy sentences. Open with the sharpest or most counterintuitive insight. Unfiltered founder voice — no softening. Max 150 words.
- x_factor: A structured lesson with magnetic pull. First line is a scroll-stopping hook. Then 3–5 bullet points using → (not •) with concrete specifics. Close with one strong, memorable statement. Max 300 words.
- deep_dive: A 5-slide carousel script. Format: "Slide 1: [text]\\nSlide 2: [text]" etc. Slide 1 is the hook. Slides 2–4 carry one key point each. Slide 5 is the CTA. Max 15 words per slide.${contextBlock}${dnaBlock}${forbiddenBlock}

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

        const result = await genai.models.generateContent({
            model: "gemini-2.5-flash-preview-05-20",
            contents,
        });

        const raw = result.text ?? "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        variations = JSON.parse(jsonMatch?.[0] ?? raw) as PostVariations;
    }

    await supabase.from("drafts").insert([
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

        const prompt = `${buildPrompt(voiceStyle, transcript, voiceDna, contextVault)}\n\nRewrite this transcript specifically as the "${variationType}" variation, applying this instruction: ${instruction}\n\nReturn ONLY the plain text of the post — no JSON, no labels.`;

        const result = await genai.models.generateContent({
            model: "gemini-2.5-flash-preview-05-20",
            contents: prompt,
        });

        aiOutput = (result.text ?? "").trim();
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
