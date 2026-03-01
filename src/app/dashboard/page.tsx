import { createSessionClient } from "@/lib/supabase/session";
import { DraftsFeed, type DbDraft } from "@/components/ui/drafts-feed";
import { QuickInput } from "@/components/ui/quick-input";

export default async function DraftsPage() {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <p className="text-lg font-semibold text-white/80">Sign in to view your drafts</p>
                <p className="text-sm text-muted-foreground">Connect your account to get started.</p>
            </div>
        );
    }

    const { data: drafts, error: draftsError } = await supabase
        .from("drafts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    console.log(`[dashboard] user=${user.id} drafts=${drafts?.length ?? 0} error=${draftsError?.message ?? "none"}`);

    return (
        <>
            <QuickInput />
            <DraftsFeed initialDrafts={(drafts as DbDraft[]) ?? []} userId={user.id} />
        </>
    );
}
