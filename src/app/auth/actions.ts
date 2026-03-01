"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData): Promise<void> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        redirect(`/auth/signin?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/dashboard");
}

export async function signUp(formData: FormData): Promise<void> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;

    const supabase = await createSessionClient();
    const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
    });

    if (error) {
        redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
    }

    if (data.user) {
        const admin = createServerClient();
        await admin.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName,
            updated_at: new Date().toISOString(),
        });
    }

    if (data.session) {
        redirect("/dashboard");
    } else {
        redirect("/auth/signin?message=Check your email to confirm your account, then sign in.");
    }
}

export async function signOut(): Promise<void> {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
    redirect("/auth/signin");
}
