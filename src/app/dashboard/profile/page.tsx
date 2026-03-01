import { createSessionClient } from "@/lib/supabase/session";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, linkedin_url, phone_number, voice_dna")
        .eq("id", user.id)
        .single();

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profile</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Your identity and the Voice DNA the AI uses to write like you.
                </p>
            </div>
            <ProfileForm
                fullName={profile?.full_name ?? ""}
                linkedinUrl={profile?.linkedin_url ?? ""}
                phoneNumber={profile?.phone_number ?? null}
                email={user.email ?? ""}
                voiceDna={profile?.voice_dna ?? ""}
            />
        </div>
    );
}
