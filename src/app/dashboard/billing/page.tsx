import { createSessionClient } from "@/lib/supabase/session";
import { BillingClient } from "./billing-client";

const FREE_LIMIT = 10;

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string }>;
}) {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const [{ count: draftCount }, { data: profile }, params] = await Promise.all([
        supabase
            .from("drafts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        supabase
            .from("profiles")
            .select("subscription_tier")
            .eq("id", user.id)
            .single(),
        searchParams,
    ]);

    const used = draftCount ?? 0;
    const usagePct = Math.min((used / FREE_LIMIT) * 100, 100);
    const currentTier = profile?.subscription_tier ?? "trial";
    const success = params.success === "true";
    const bufferConnected = !!process.env.BUFFER_API_KEY;

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Billing</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your plan and usage.</p>
            </div>

            <BillingClient used={used} usagePct={usagePct} currentTier={currentTier} success={success} bufferConnected={bufferConnected} />
        </div>
    );
}
