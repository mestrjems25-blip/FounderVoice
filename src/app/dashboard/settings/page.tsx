import { randomBytes } from "crypto";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";
import { getConnectedPlatforms } from "@/lib/social/client";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ social?: string }> }) {
    const { social: socialParam } = await searchParams;
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    let { data: profile } = await supabase
        .from("profiles")
        .select("whatsapp_notifications, phone_number, whatsapp_sync_token")
        .eq("id", user.id)
        .single();

    if (!profile?.whatsapp_sync_token) {
        const token = randomBytes(3).toString("hex");
        const admin = createServerClient();
        const { error: tokenError } = await admin
            .from("profiles")
            .upsert({ id: user.id, whatsapp_sync_token: token, updated_at: new Date().toISOString() });

        if (tokenError) {
            console.error("[settings] Failed to save verification token:", tokenError.message);
        }
        profile = { ...profile, whatsapp_sync_token: token } as typeof profile;
    }

    const verificationToken = profile!.whatsapp_sync_token!;
    const waNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "14155238886").replace(/\D/g, "");
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Verify my account: ${verificationToken}`)}`;

    const connectedPlatforms = process.env.UPLOAD_POST_API_KEY
        ? await getConnectedPlatforms(user.id).catch(() => ({ x: false, linkedin: false }))
        : { x: false, linkedin: false };

    return (
        <SettingsClient
            whatsappNotifications={profile?.whatsapp_notifications ?? true}
            phoneNumber={profile?.phone_number ?? null}
            verificationToken={verificationToken}
            waLink={waLink}
            linkedinConnected={connectedPlatforms.linkedin}
            xConnected={connectedPlatforms.x}
            xHandle={connectedPlatforms.xHandle}
            linkedinHandle={connectedPlatforms.linkedinHandle}
            socialStatus={socialParam === "connected" ? "connected" : socialParam === "error" ? "error" : undefined}
        />
    );
}
