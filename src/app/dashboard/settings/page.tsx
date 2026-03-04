import { randomBytes } from "crypto";
import { createSessionClient } from "@/lib/supabase/session";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    let { data: profile } = await supabase
        .from("profiles")
        .select("whatsapp_notifications, phone_number, whatsapp_sync_token")
        .eq("id", user.id)
        .single();

    // Auto-generate a verification code if the user doesn't have one yet
    if (!profile?.whatsapp_sync_token) {
        const token = randomBytes(3).toString("hex");
        await supabase
            .from("profiles")
            .update({ whatsapp_sync_token: token, updated_at: new Date().toISOString() })
            .eq("id", user.id);
        profile = { ...profile, whatsapp_sync_token: token } as typeof profile;
    }

    const verificationToken = profile!.whatsapp_sync_token!;
    const waNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "14155238886").replace(/\D/g, "");
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Verify my account: ${verificationToken}`)}`;

    return (
        <SettingsClient
            whatsappNotifications={profile?.whatsapp_notifications ?? true}
            phoneNumber={profile?.phone_number ?? null}
            verificationToken={verificationToken}
            waLink={waLink}
        />
    );
}
