import { createSessionClient } from "@/lib/supabase/session";
import { TRIAL_DAYS } from "@/lib/trial";
import { BarChart3, FileText, Lock, Mic, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    accent: string;
}

function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
    return (
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-white/40 uppercase tracking-widest">{label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
                    <div style={{ color: accent }}>{icon}</div>
                </div>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            {sub && <p className="text-xs text-white/40">{sub}</p>}
        </div>
    );
}

interface BarRowProps {
    label: string;
    value: number;
    max: number;
    color: string;
    sublabel?: string;
}

function BarRow({ label, value, max, color, sublabel }: BarRowProps) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="text-white/70 font-medium">{label}</span>
                <span className="text-white/40 text-xs">{sublabel ?? value}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
        </div>
    );
}

function LockedRow({ label }: { label: string }) {
    return (
        <div className="relative">
            <div className="flex flex-col gap-1.5 select-none pointer-events-none" style={{ filter: "blur(4px)" }}>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70 font-medium">{label}</span>
                    <span className="text-white/40 text-xs">— drafts</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-2/5 rounded-full bg-white/20" />
                </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-end">
                <Link
                    href="/dashboard/billing"
                    className="flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-lg"
                    style={{
                        background: "rgba(99,102,241,0.12)",
                        color: "#818cf8",
                        border: "1px solid rgba(99,102,241,0.2)",
                    }}
                >
                    <Lock className="w-3 h-3" />
                    Pro only
                </Link>
            </div>
        </div>
    );
}

export default async function AnalyticsPage() {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [{ data: drafts }, { count: voiceCount }, { data: profile }] = await Promise.all([
        supabase
            .from("drafts")
            .select("variation_type, status, created_at")
            .eq("user_id", user.id),
        supabase
            .from("voice_samples")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        supabase
            .from("profiles")
            .select("subscription_tier, trial_started_at")
            .eq("id", user.id)
            .single(),
    ]);

    const tier = (profile?.subscription_tier ?? "trial") as string;
    const isBasic = tier === "basic";

    const trialStart = profile?.trial_started_at ? new Date(profile.trial_started_at) : new Date();
    const daysElapsed = (Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24);
    const daysRemaining = Math.max(0, Math.ceil(TRIAL_DAYS - daysElapsed));

    const totalDrafts = drafts?.length ?? 0;
    const published = drafts?.filter((d) => d.status === "published").length ?? 0;
    const thisWeekCount = drafts?.filter((d) => d.created_at >= weekAgo).length ?? 0;
    const brutalCount = drafts?.filter((d) => d.variation_type === "brutal").length ?? 0;
    const deepDiveCount = drafts?.filter((d) => d.variation_type === "deep_dive").length ?? 0;
    const xFactorCount = drafts?.filter((d) => d.variation_type === "x_factor").length ?? 0;
    const voiceSessions = voiceCount ?? 0;
    const voiceMinutes = Math.round(voiceSessions * 2.4);

    const brutalReach = brutalCount * 900;
    const deepDiveReach = deepDiveCount * 1800;
    const xFactorReach = xFactorCount * 2600;
    const totalEstimatedReach = brutalReach + deepDiveReach + xFactorReach;
    const maxReach = Math.max(brutalReach, deepDiveReach, xFactorReach, 1);

    const publishRate = totalDrafts > 0 ? `${Math.round((published / totalDrafts) * 100)}%` : "0%";

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">Your content output and estimated audience reach.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Drafts"
                    value={totalDrafts}
                    sub={`${published} published`}
                    icon={<FileText className="w-4 h-4" />}
                    accent="#6366f1"
                />
                <StatCard
                    label="This Week"
                    value={thisWeekCount}
                    sub="drafts in last 7 days"
                    icon={<Zap className="w-4 h-4" />}
                    accent="#f59e0b"
                />
                <StatCard
                    label="Voice Sessions"
                    value={voiceSessions}
                    sub={`~${voiceMinutes} min processed`}
                    icon={<Mic className="w-4 h-4" />}
                    accent="#E855A0"
                />
                {tier === "trial" ? (
                    <StatCard
                        label="Days Left"
                        value={daysRemaining}
                        sub={`of ${TRIAL_DAYS}-day free trial`}
                        icon={<TrendingUp className="w-4 h-4" />}
                        accent={daysRemaining <= 2 ? "#ef4444" : "#22c55e"}
                    />
                ) : (
                    <StatCard
                        label="Publish Rate"
                        value={publishRate}
                        sub="drafts → published"
                        icon={<TrendingUp className="w-4 h-4" />}
                        accent="#22c55e"
                    />
                )}
            </div>

            <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#818cf8]" />
                    <p className="text-sm font-semibold text-white">Potential Reach by Post Type</p>
                    {isBasic && (
                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#6366f1]/10 text-[#818cf8] border border-[#6366f1]/20">
                            Partial — upgrade for full access
                        </span>
                    )}
                </div>

                {totalDrafts === 0 ? (
                    <p className="text-xs text-white/30 py-4 text-center">Send your first voice note to see reach estimates.</p>
                ) : (
                    <div className="flex flex-col gap-5">
                        <BarRow
                            label="Brutal"
                            value={brutalReach}
                            max={maxReach}
                            color="linear-gradient(90deg, #6366f1, #818cf8)"
                            sublabel={`${brutalCount} drafts · ~${brutalReach.toLocaleString()} impressions`}
                        />
                        {isBasic ? (
                            <LockedRow label="X-Factor" />
                        ) : (
                            <BarRow
                                label="X-Factor"
                                value={xFactorReach}
                                max={maxReach}
                                color="linear-gradient(90deg, #E855A0, #f472b6)"
                                sublabel={`${xFactorCount} drafts · ~${xFactorReach.toLocaleString()} impressions`}
                            />
                        )}
                        {isBasic ? (
                            <LockedRow label="Deep Dive" />
                        ) : (
                            <BarRow
                                label="Deep Dive"
                                value={deepDiveReach}
                                max={maxReach}
                                color="linear-gradient(90deg, #22c55e, #4ade80)"
                                sublabel={`${deepDiveCount} drafts · ~${deepDiveReach.toLocaleString()} impressions`}
                            />
                        )}
                    </div>
                )}

                <p className="text-[10px] text-white/20 border-t border-white/5 pt-4">
                    Reach estimates based on LinkedIn average impressions per post type. Actual results vary by audience size and posting time.
                </p>
            </div>

            <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
                <p className="text-sm font-semibold text-white">Draft Status Breakdown</p>
                {(["draft", "pending", "approved", "published"] as const).map((status) => {
                    const count = drafts?.filter((d) => d.status === status).length ?? 0;
                    const colors: Record<string, string> = {
                        draft: "#818cf8",
                        pending: "#fbbf24",
                        approved: "#34d399",
                        published: "#a78bfa",
                    };
                    return (
                        <BarRow
                            key={status}
                            label={status.charAt(0).toUpperCase() + status.slice(1)}
                            value={count}
                            max={Math.max(totalDrafts, 1)}
                            color={colors[status]}
                            sublabel={String(count)}
                        />
                    );
                })}
            </div>

            {isBasic && (
                <div
                    className="rounded-2xl p-6 flex flex-col gap-4 text-center"
                    style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}
                >
                    <p className="text-sm font-semibold text-white">Unlock your full content analytics</p>
                    <p className="text-xs text-white/40 max-w-sm mx-auto">
                        Upgrade to Pro to see Deep Dive and Carousel reach, voice minute breakdowns, and weekly velocity charts.
                    </p>
                    <Link
                        href="/dashboard/billing"
                        className="inline-flex items-center gap-2 mx-auto text-sm font-medium px-6 py-2.5 rounded-xl"
                        style={{ background: "#6366f1", color: "#fff" }}
                    >
                        <Zap className="w-4 h-4" />
                        Upgrade to Pro — $49/mo
                    </Link>
                </div>
            )}
        </div>
    );
}
