import { Sidebar } from "@/components/ui/sidebar-nav";
import { TrialBanner } from "@/components/ui/trial-banner";
import { createSessionClient } from "@/lib/supabase/session";
import { getSubscriptionStatus, maybeDowngrade } from "@/lib/trial";
import type { SubscriptionTier } from "@/lib/trial";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let tier: SubscriptionTier = "trial";
    let daysRemaining = 7;
    let draftCount = 0;

    try {
        const supabase = await createSessionClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const [status, { count }] = await Promise.all([
                getSubscriptionStatus(user.id, supabase),
                supabase
                    .from("drafts")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", user.id),
            ]);
            tier = await maybeDowngrade(user.id, status, supabase);
            daysRemaining = status.daysRemaining;
            draftCount = count ?? 0;
        }
    } catch {
        // Non-fatal — banner just won't render if profile fetch fails
    }

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden dashboard-wrapper bg-[#100F11] md:bg-transparent">
            <Sidebar tier={tier} draftCount={draftCount} />
            <main className="flex-1 overflow-y-auto bg-black md:bg-transparent">
                <div className="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
                    <TrialBanner tier={tier} daysRemaining={daysRemaining} />
                    {children}
                </div>
            </main>
        </div>
    );
}
