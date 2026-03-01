import { createSessionClient } from "@/lib/supabase/session";
import { redirect, notFound } from "next/navigation";
import { EditorClient } from "./editor-client";

export default async function EditorPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const supabase = await createSessionClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/");

    const { data: draft } = await supabase
        .from("drafts")
        .select("id, raw_transcript, ai_output, status, variation_type")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (!draft) notFound();

    return (
        <EditorClient
            draft={{
                id: draft.id,
                rawTranscript: draft.raw_transcript,
                aiOutput: draft.ai_output,
                status: draft.status,
                variationType: draft.variation_type,
            }}
        />
    );
}
