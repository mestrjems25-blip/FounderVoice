import { createSessionClient } from "@/lib/supabase/session";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("whatsapp_notifications, phone_number")
        .eq("id", user.id)
        .single();

    return (
        <SettingsClient
            whatsappNotifications={profile?.whatsapp_notifications ?? true}
            phoneNumber={profile?.phone_number ?? null}
        />
    );
}
