import { createServerClient } from "./server";

export async function getUserByPhone(rawPhone: string): Promise<string | null> {
    const phone = rawPhone.replace(/^whatsapp:/, "");
    const supabase = createServerClient();

    const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone_number", phone)
        .single();

    return data?.id ?? null;
}
