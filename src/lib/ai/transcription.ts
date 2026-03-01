import Groq from "groq-sdk";
import { createServerClient } from "@/lib/supabase/server";

// ─── PREMIUM UPGRADE (OpenAI Whisper) ────────────────────────────────────────
// import OpenAI, { toFile } from "openai";
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const { text } = await openai.audio.transcriptions.create({ file, model: "whisper-1", language: "en" });
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_MODE = process.env.MOCK_MODE === "true";

const MOCK_TRANSCRIPT =
    "This is a mock transcript of a founder talking about the importance of scaling AI-native SaaS in 2026 without increasing headcount.";

export async function transcribeAudio(
    voiceSampleId: string,
    audioUrl: string
): Promise<string> {
    const supabase = createServerClient();

    if (MOCK_MODE) {
        await new Promise<void>((resolve) => setTimeout(resolve, 2000));
        await supabase
            .from("voice_samples")
            .update({ transcript: MOCK_TRANSCRIPT, processed: true })
            .eq("id", voiceSampleId);
        return MOCK_TRANSCRIPT;
    }

    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
        throw new Error(`Audio fetch failed: ${audioResponse.status}`);
    }

    const buffer = Buffer.from(await audioResponse.arrayBuffer());
    const audioFile = new File([buffer], "audio.ogg", { type: "audio/ogg" });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { text } = await groq.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-large-v3-turbo",
        language: "en",
    });

    await supabase
        .from("voice_samples")
        .update({ transcript: text, processed: true })
        .eq("id", voiceSampleId);

    return text;
}
