import { createSessionClient } from "@/lib/supabase/session";
import { VoiceProfileForm } from "./voice-profile-form";
import type { VoiceStyle } from "@/app/dashboard/actions";

export default async function VoiceProfilePage() {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-muted-foreground text-sm">Sign in to manage your voice profile.</p>
            </div>
        );
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("voice_style, context_vault")
        .eq("id", user.id)
        .single();

    const voiceStyle = (profile?.voice_style as VoiceStyle) ?? {};
    const contextVault = profile?.context_vault ?? "";

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Voice Profile</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    This is what Claude uses to match your tone. The more specific, the better your posts.
                </p>
            </div>
            <VoiceProfileForm initialStyle={voiceStyle} initialContextVault={contextVault} />
        </div>
    );
}
