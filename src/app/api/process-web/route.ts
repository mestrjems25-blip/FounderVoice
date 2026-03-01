import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
// ─── PREMIUM UPGRADE (OpenAI Whisper) ────────────────────────────────────────
// import OpenAI, { toFile } from "openai";
// ─────────────────────────────────────────────────────────────────────────────
import sharp from "sharp";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";
import { processTranscript } from "@/lib/ai/processor";

const DAILY_LIMIT = 10;
const MOCK_MODE = process.env.MOCK_MODE === "true";
const MOCK_TRANSCRIPT =
    "We scaled to $1M ARR without a sales team by building in public and letting our users become our marketing.";

export async function POST(request: NextRequest): Promise<NextResponse> {
    const sessionSupabase = await createSessionClient();
    const {
        data: { user },
    } = await sessionSupabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: profileRow } = await supabase
        .from("profiles")
        .select("daily_requests_count, last_request_date")
        .eq("id", user.id)
        .single();

    const today = new Date().toISOString().split("T")[0];
    const lastDate = profileRow?.last_request_date ?? null;
    const dailyCount = lastDate === today ? (profileRow?.daily_requests_count ?? 0) : 0;

    if (dailyCount >= DAILY_LIMIT) {
        return NextResponse.json(
            { error: `Daily limit of ${DAILY_LIMIT} reached. Upgrade to Pro for unlimited drafts.` },
            { status: 429 }
        );
    }

    const formData = await request.formData();
    const type = formData.get("type") as "text" | "audio" | "image";

    let transcript = "";
    let sourceAudioUrl: string | null = null;
    let sourceImageUrl: string | undefined;

    try {
        if (type === "text") {
            transcript = ((formData.get("content") as string) ?? "").trim();
            if (!transcript) {
                return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
            }
            await supabase
                .from("voice_samples")
                .insert({ user_id: user.id, audio_url: "text://", processed: true });
        } else if (type === "audio") {
            const file = formData.get("file") as File | null;
            if (!file) {
                return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const mimeType = file.type || "audio/webm";
            const ext = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : "webm";
            const storagePath = `${user.id}/${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from("voice-memos")
                .upload(storagePath, buffer, { contentType: mimeType, upsert: false });
            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from("voice-memos").getPublicUrl(storagePath);
            sourceAudioUrl = publicUrl;

            const { data: sampleRow, error: sampleError } = await supabase
                .from("voice_samples")
                .insert({ user_id: user.id, audio_url: sourceAudioUrl, processed: false })
                .select("id")
                .single();
            if (sampleError || !sampleRow) throw sampleError ?? new Error("voice_samples insert failed");

            if (MOCK_MODE) {
                transcript = MOCK_TRANSCRIPT;
                await supabase
                    .from("voice_samples")
                    .update({ transcript, processed: true })
                    .eq("id", sampleRow.id);
            } else {
                // ─── PREMIUM UPGRADE (OpenAI Whisper) ──────────────────────────
                // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                // const audioFile = await toFile(buffer, `recording.${ext}`, { type: mimeType });
                // const { text } = await openai.audio.transcriptions.create({ file: audioFile, model: "whisper-1", language: "en" });
                // ───────────────────────────────────────────────────────────────
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const audioFile = new File([buffer], `recording.${ext}`, { type: mimeType });
                const { text } = await groq.audio.transcriptions.create({
                    file: audioFile,
                    model: "whisper-large-v3-turbo",
                    language: "en",
                });
                transcript = text;
                await supabase
                    .from("voice_samples")
                    .update({ transcript, processed: true })
                    .eq("id", sampleRow.id);
            }
        } else if (type === "image") {
            const file = formData.get("file") as File | null;
            if (!file) {
                return NextResponse.json({ error: "No image file provided" }, { status: 400 });
            }

            const rawBuffer = Buffer.from(await file.arrayBuffer());
            const imageBuffer = await sharp(rawBuffer)
                .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();

            const storagePath = `${user.id}/${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from("voice-memos")
                .upload(storagePath, imageBuffer, { contentType: "image/jpeg", upsert: false });
            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from("voice-memos").getPublicUrl(storagePath);
            sourceImageUrl = publicUrl;
            transcript = ((formData.get("caption") as string) ?? "").trim();

            await supabase
                .from("voice_samples")
                .insert({ user_id: user.id, audio_url: sourceImageUrl, processed: true });
        } else {
            return NextResponse.json({ error: "Invalid input type" }, { status: 400 });
        }

        await processTranscript(user.id, transcript, sourceAudioUrl, sourceImageUrl);

        await supabase
            .from("profiles")
            .update({
                daily_requests_count: dailyCount + 1,
                last_request_date: today,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[process-web] Error:", err);
        return NextResponse.json({ error: "Processing failed. Please try again." }, { status: 500 });
    }
}
