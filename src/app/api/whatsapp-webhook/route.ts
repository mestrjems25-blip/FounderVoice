import { after, NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import sharp from "sharp";
import { validateTwilioSignature } from "@/lib/twilio/validate";
import { getUserByPhone } from "@/lib/supabase/queries";
import { createServerClient } from "@/lib/supabase/server";
import { transcribeAudio } from "@/lib/ai/transcription";
import { processTranscript } from "@/lib/ai/processor";

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER ?? "+14155238886";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const MOCK_MODE = process.env.MOCK_MODE === "true";

async function downloadTwilioMedia(mediaUrl: string): Promise<Buffer> {
    const credentials = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");
    const response = await fetch(mediaUrl, {
        headers: { Authorization: `Basic ${credentials}` },
    });
    if (!response.ok) {
        throw new Error(`Media download failed: ${response.status}`);
    }
    return Buffer.from(await response.arrayBuffer());
}

async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
    const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
    await client.messages.create({ from: `whatsapp:${WHATSAPP_NUMBER}`, to, body });
}

async function resizeImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
        .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
}

const DAILY_LIMIT = 10;

async function handleNewUser(from: string, supabase: ReturnType<typeof createServerClient>): Promise<void> {
    const cleanPhone = from.replace(/^whatsapp:/, "");
    const syntheticEmail = `wa_${cleanPhone.replace(/\D/g, "")}@foundervoice.app`;
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    console.log(`[pipeline] handleNewUser — email: ${syntheticEmail} | SERVICE_ROLE set: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);

    const { data: authData, error: createUserError } = await supabase.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        user_metadata: { phone_number: cleanPhone },
    });

    if (createUserError) {
        console.error(`[pipeline] createUser error:`, createUserError.message);
    }

    if (!authData?.user) {
        console.error(`[pipeline] handleNewUser — createUser returned no user for ${cleanPhone}`);
        return;
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        phone_number: cleanPhone,
        whatsapp_sync_token: token,
        whatsapp_sync_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
    });

    if (upsertError) {
        console.error(`[pipeline] profiles upsert error:`, upsertError.message);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://foundervoice-lovat.vercel.app`;
    const syncLink = `${baseUrl}/api/auth/whatsapp-sync?token=${token}`;
    const welcome = `Welcome to FounderVoice! Tap here to sync your account and set up your Voice DNA: ${syncLink}\n\nOnce synced, just send me a voice note, text, or photo and I'll write your next LinkedIn post.`;

    console.log(`[pipeline] New user registered: ${authData.user.id} | phone: ${cleanPhone}`);

    if (MOCK_MODE) {
        console.log(`[pipeline] New user ${cleanPhone} — would send: "${welcome}"`);
    } else {
        try {
            await sendWhatsAppMessage(from, welcome);
            console.log(`[pipeline] Welcome message sent to ${from}`);
        } catch (err) {
            console.error(`[pipeline] Welcome message failed (registration still succeeded):`, err);
        }
    }
}

type InputType = "audio" | "text" | "image";

async function runPipeline(params: Record<string, string>): Promise<void> {
    const { From, MediaUrl0, MediaContentType0, Body } = params;
    const numMedia = Number(params.NumMedia ?? 0);

    console.log(`[pipeline] START — From: ${From} | MOCK_MODE: ${MOCK_MODE}`);

    const userId = await getUserByPhone(From);
    console.log(`[pipeline] getUserByPhone → userId: ${userId ?? "NULL (unregistered)"}`);

    const supabase = createServerClient();

    if (!userId) {
        console.warn(`[pipeline] No profile matches phone: ${From} — triggering new user registration`);
        await handleNewUser(From, supabase);
        return;
    }

    const { data: profileRow } = await supabase
        .from("profiles")
        .select("subscription_tier, whatsapp_notifications, full_name, daily_requests_count, last_request_date")
        .eq("id", userId)
        .single();

    const tier = profileRow?.subscription_tier ?? "trial";
    const whatsappNotifications = profileRow?.whatsapp_notifications ?? true;

    // Daily rate-limit check (resets at midnight UTC)
    const today = new Date().toISOString().split("T")[0];
    const lastDate = profileRow?.last_request_date ?? null;
    const dailyCount = lastDate === today ? (profileRow?.daily_requests_count ?? 0) : 0;

    if (dailyCount >= DAILY_LIMIT) {
        const msg = `You've reached your daily limit of ${DAILY_LIMIT} posts. Upgrade to Pro for unlimited content: ${APP_URL}/dashboard/billing`;
        if (MOCK_MODE) {
            console.log(`[pipeline] Daily limit reached — would send: "${msg}"`);
        } else {
            await sendWhatsAppMessage(From, msg);
        }
        console.log(`[pipeline] Aborting — daily limit reached for ${userId} (count: ${dailyCount})`);
        return;
    }

    if (tier === "basic") {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const { count: monthlyCount } = await supabase
            .from("voice_samples")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", monthStart.toISOString());

        if ((monthlyCount ?? 0) >= 3) {
            const msg = `You've used all 3 monthly inputs on the Basic plan. Upgrade to Pro for unlimited drafts: ${APP_URL}/dashboard/billing`;
            if (MOCK_MODE) {
                console.log(`[pipeline] Basic plan limit reached — would send: "${msg}"`);
            } else {
                await sendWhatsAppMessage(From, msg);
            }
            console.log(`[pipeline] Aborting — basic plan monthly limit reached for ${userId}`);
            return;
        }
    }

    // Determine input type
    let inputType: InputType;
    if (MOCK_MODE) {
        inputType = "audio";
    } else if (numMedia > 0 && MediaContentType0?.startsWith("image/")) {
        inputType = "image";
    } else if (numMedia > 0 && MediaContentType0?.startsWith("audio/")) {
        inputType = "audio";
    } else {
        inputType = "text";
    }
    console.log(`[pipeline] inputType: ${inputType}`);

    let sourceAudioUrl: string | null = null;
    let sourceImageUrl: string | null = null;

    if (MOCK_MODE) {
        sourceAudioUrl = "mock://voice-placeholder";
        console.log(`[pipeline] Mock mode — skipping media processing`);
    } else if (inputType === "audio") {
        const audioBuffer = await downloadTwilioMedia(MediaUrl0);
        const storagePath = `${userId}/${Date.now()}.ogg`;

        const { error: uploadError } = await supabase.storage
            .from("voice-memos")
            .upload(storagePath, audioBuffer, { contentType: "audio/ogg", upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from("voice-memos")
            .getPublicUrl(storagePath);
        sourceAudioUrl = publicUrl;
    } else if (inputType === "image") {
        const rawBuffer = await downloadTwilioMedia(MediaUrl0);
        const imageBuffer = await resizeImage(rawBuffer);
        const storagePath = `${userId}/${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
            .from("voice-memos")
            .upload(storagePath, imageBuffer, { contentType: "image/jpeg", upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from("voice-memos")
            .getPublicUrl(storagePath);
        sourceImageUrl = publicUrl;
    }

    const sampleAudioUrl = sourceAudioUrl ?? sourceImageUrl ?? "text://";
    const { data: sampleRow, error: sampleError } = await supabase
        .from("voice_samples")
        .insert({ user_id: userId, audio_url: sampleAudioUrl, processed: false })
        .select("id")
        .single();

    if (sampleError) {
        console.error(`[pipeline] voice_samples insert error:`, sampleError);
        throw sampleError;
    }
    if (!sampleRow) throw new Error("voice_samples insert returned no row");
    console.log(`[pipeline] voice_samples row created: ${sampleRow.id}`);

    let transcript: string;
    if (MOCK_MODE) {
        transcript = "We scaled to $1M ARR without a sales team by building in public and letting our users become our marketing.";
        console.log(`[pipeline] Mock transcript set`);
    } else if (inputType === "audio") {
        console.log(`[pipeline] Starting transcription...`);
        transcript = await transcribeAudio(sampleRow.id, sourceAudioUrl!);
        console.log(`[pipeline] Transcript ready (${transcript.length} chars)`);
    } else if (inputType === "image") {
        transcript = Body?.trim() ?? "";
        console.log(`[pipeline] Image input — caption: "${transcript || "(none)"}"`);
    } else {
        transcript = Body!.trim();
        console.log(`[pipeline] Text input (${transcript.length} chars)`);
    }

    console.log(`[pipeline] Starting tone processor — inserting 3 drafts...`);
    await processTranscript(userId, transcript, sourceAudioUrl, sourceImageUrl ?? undefined);
    console.log(`[pipeline] 3 drafts inserted`);

    // Increment daily counter
    await supabase
        .from("profiles")
        .update({
            daily_requests_count: dailyCount + 1,
            last_request_date: today,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    const firstName = profileRow?.full_name?.split(" ")[0] ?? "there";
    const replyBody = `Your 3 drafts are ready, ${firstName}! View and approve them here: ${APP_URL}/dashboard`;

    if (MOCK_MODE) {
        console.log(`[pipeline] DONE — mock complete for ${userId}. Reply would be: "${replyBody}"`);
    } else if (whatsappNotifications) {
        await sendWhatsAppMessage(From, replyBody);
        console.log(`[pipeline] DONE — WhatsApp reply sent to ${From}`);
    } else {
        console.log(`[pipeline] DONE — WhatsApp notifications disabled for ${userId}, skipping reply`);
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const signature = request.headers.get("x-twilio-signature") ?? "";

    // Derive the canonical webhook URL from the request itself so it always
    // matches what Twilio signed, regardless of whether APP_URL is set.
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    const host = request.headers.get("host") ?? "";
    const webhookUrl = `${proto}://${host}${request.nextUrl.pathname}`;

    const formData = await request.formData();
    const params = Object.fromEntries(formData) as Record<string, string>;

    console.log("[webhook] Incoming WhatsApp payload:", JSON.stringify(params));
    console.log(`[webhook] MOCK_MODE=${MOCK_MODE} | webhookUrl=${webhookUrl} | sig=${signature.slice(0, 12)}...`);

    if (!MOCK_MODE && !validateTwilioSignature(AUTH_TOKEN, signature, webhookUrl, params)) {
        console.error(`[webhook] Signature validation FAILED — webhookUrl used: ${webhookUrl}`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { From, NumMedia, MediaContentType0, Body } = params;
    console.log(`[webhook] POST — From: ${From} | NumMedia: ${NumMedia} | ContentType: ${MediaContentType0 ?? "none"} | MOCK: ${MOCK_MODE}`);

    if (!From) {
        return NextResponse.json({ error: "Missing From" }, { status: 400 });
    }

    const numMedia = Number(NumMedia ?? 0);
    const hasMedia = numMedia > 0;
    const hasText = !!Body?.trim();
    const isProcessable = MOCK_MODE || hasMedia || hasText;
    console.log(`[webhook] hasMedia: ${hasMedia} | hasText: ${hasText} | isProcessable: ${isProcessable}`);

    if (!isProcessable) {
        return NextResponse.json({ received: true }, { status: 200 });
    }

    after(async () => {
        try {
            await runPipeline(params);
        } catch (error) {
            console.error("[whatsapp-webhook] Pipeline error:", error);
        }
    });

    return NextResponse.json({ received: true }, { status: 200 });
}

export async function GET(): Promise<NextResponse> {
    return NextResponse.json(
        { status: "ok", service: "FounderVoice AI — WhatsApp Webhook" },
        { status: 200 }
    );
}
