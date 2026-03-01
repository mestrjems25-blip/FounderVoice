import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MOCK_MODE = process.env.MOCK_MODE === "true";

const MOCK_REGEN =
    "Scaling in 2026 isn't about more people. It's about better leverage. We hit $1M ARR with 2 people and a fleet of AI agents. Stop hiring. Start automating.";

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

        const system = `You are a world-class LinkedIn ghostwriter for a specific founder. No jargon, no hashtags, no filler. Write exactly as this founder writes — direct, human, specific.${toneClause}${dnaBlock}${contextBlock}`;

        const response = await anthropic.messages.create({
            model: "claude-opus-4-6",
            max_tokens: 1024,
            thinking: { type: "adaptive" },
            system,
            messages: [
                {
                    role: "user",
                    content: `Apply this rewrite instruction: ${instruction}\n\nOriginal transcript:\n${draft.raw_transcript}\n\nReturn ONLY the plain rewritten post — no JSON, no labels, no explanation.`,
                },
            ],
        });

        const textBlock = response.content.find((b) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") {
            return NextResponse.json({ error: "No response from AI" }, { status: 500 });
        }
        aiOutput = textBlock.text.trim();
    }

    await supabase
        .from("drafts")
        .update({ ai_output: aiOutput, status: "pending", updated_at: new Date().toISOString() })
        .eq("id", draftId)
        .eq("user_id", user.id);

    return NextResponse.json({ aiOutput });
}
