import type { SupabaseClient } from "@supabase/supabase-js";

export const TRIAL_DAYS = 7;

export type SubscriptionTier = "trial" | "basic" | "pro" | "founder";

export interface SubscriptionStatus {
    tier: SubscriptionTier;
    trialStartedAt: Date | null;
    daysRemaining: number;
    isExpired: boolean;
}

export async function getSubscriptionStatus(
    userId: string,
    supabase: SupabaseClient
): Promise<SubscriptionStatus> {
    const { data } = await supabase
        .from("profiles")
        .select("subscription_tier, trial_started_at")
        .eq("id", userId)
        .single();

    const tier = (data?.subscription_tier ?? "trial") as SubscriptionTier;
    const trialStartedAt = data?.trial_started_at ? new Date(data.trial_started_at) : null;

    const msElapsed = trialStartedAt ? Date.now() - trialStartedAt.getTime() : 0;
    const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);
    const daysRemaining = Math.max(0, Math.ceil(TRIAL_DAYS - daysElapsed));
    const isExpired = daysElapsed >= TRIAL_DAYS;

    return { tier, trialStartedAt, daysRemaining, isExpired };
}

export async function maybeDowngrade(
    userId: string,
    status: SubscriptionStatus,
    supabase: SupabaseClient
): Promise<SubscriptionTier> {
    if (status.tier === "trial" && status.isExpired) {
        await supabase
            .from("profiles")
            .update({ subscription_tier: "basic" })
            .eq("id", userId);
        return "basic";
    }
    return status.tier;
}
