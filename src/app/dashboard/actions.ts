"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";
import { getChannels, createPost } from "@/lib/buffer/client";

export interface VoiceStyle {
    tone?: "professional" | "casual" | "provocative" | "inspirational";
    formatting?: "bullet-points" | "story" | "listicle" | "thread";
    signature?: string;
    avoidWords?: string[];
}

export async function publishDraft(draftId: string, scheduledAt?: string): Promise<void> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: draft } = await supabase
        .from("drafts")
        .select("ai_output, variation_type")
        .eq("id", draftId)
        .eq("user_id", user.id)
        .single();

    if (!draft) throw new Error("Draft not found");

    if (process.env.BUFFER_API_KEY) {
        let channelId = process.env.BUFFER_LINKEDIN_CHANNEL_ID;
        if (!channelId) {
            const channels = await getChannels();
            const target = channels.find((c) => c.service === "linkedin") ?? channels[0];
            channelId = target?.id;
        }
        if (channelId) await createPost(channelId, draft.ai_output, scheduledAt);
    }

    await supabase
        .from("drafts")
        .update({
            status: scheduledAt ? "scheduled" : "published",
            scheduled_at: scheduledAt ?? null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", draftId)
        .eq("user_id", user.id);

    revalidatePath("/dashboard");
}

export async function saveDraftEdit(draftId: string, aiOutput: string): Promise<void> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase
        .from("drafts")
        .update({ ai_output: aiOutput, updated_at: new Date().toISOString() })
        .eq("id", draftId)
        .eq("user_id", user.id);

    revalidatePath("/dashboard");
}

export async function updateVoiceStyle(style: VoiceStyle): Promise<void> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase
        .from("profiles")
        .upsert({
            id: user.id,
            voice_style: style,
            updated_at: new Date().toISOString(),
        });

    revalidatePath("/dashboard/voice-profile");
}

export async function updateProfile(fullName: string, linkedinUrl: string): Promise<void> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase
        .from("profiles")
        .update({
            full_name: fullName,
            linkedin_url: linkedinUrl,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    revalidatePath("/dashboard/profile");
}

export async function updateContextVault(contextVault: string): Promise<void> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase
        .from("profiles")
        .update({ context_vault: contextVault, updated_at: new Date().toISOString() })
        .eq("id", user.id);

    revalidatePath("/dashboard/voice-profile");
}

export async function updateVoiceDna(voiceDna: string): Promise<void> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase
        .from("profiles")
        .update({ voice_dna: voiceDna, updated_at: new Date().toISOString() })
        .eq("id", user.id);

    revalidatePath("/dashboard/profile");
}

export async function updateSettings(whatsappNotifications: boolean): Promise<void> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase
        .from("profiles")
        .update({ whatsapp_notifications: whatsappNotifications, updated_at: new Date().toISOString() })
        .eq("id", user.id);

    revalidatePath("/dashboard/settings");
}

export async function deleteStack(draftIds: string[]): Promise<void> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase
        .from("drafts")
        .delete()
        .in("id", draftIds)
        .eq("user_id", user.id);

    revalidatePath("/dashboard");
}

export async function deleteAllData(): Promise<void> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase.from("drafts").delete().eq("user_id", user.id);
    await supabase.from("voice_samples").delete().eq("user_id", user.id);

    revalidatePath("/dashboard");
}

export async function deleteAccount(): Promise<void> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase.auth.signOut();

    const admin = createServerClient();
    await admin.auth.admin.deleteUser(user.id);

    redirect("/");
}

export async function generateWhatsAppLink(): Promise<string> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { randomBytes } = await import("crypto");
    const token = randomBytes(3).toString("hex"); // 6-char code, e.g. "a3f9c2"

    await supabase
        .from("profiles")
        .update({
            whatsapp_sync_token: token,
            whatsapp_sync_expires_at: null, // no expiry — token is valid until used
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    const waNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "14155238886").replace(/\D/g, "");
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(`Verify my account: ${token}`)}`;
}

export async function disconnectWhatsApp(): Promise<void> {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase
        .from("profiles")
        .update({
            phone_number: null,
            whatsapp_sync_token: null,
            whatsapp_sync_expires_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    revalidatePath("/dashboard/settings");
}
