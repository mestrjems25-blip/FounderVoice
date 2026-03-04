"use client";

import { useTransition } from "react";
import { Check, CheckCircle2, CreditCard, Building2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FREE_LIMIT = 10;

type TierKey = "free" | "pro" | "founder";

interface Tier {
    key: TierKey;
    name: string;
    price: string;
    period: string;
    description: string;
    icon: React.ReactNode;
    accent: string;
    features: string[];
    matchesPlan: (tier: string) => boolean;
}

const TIERS: Tier[] = [
    {
        key: "free",
        name: "Free",
        price: "$0",
        period: "/mo",
        description: "Test the full pipeline end-to-end.",
        icon: <Zap className="w-5 h-5" />,
        accent: "#6366f1",
        features: [
            "10 AI drafts / month",
            "3 post variations per input",
            "Omni-Input (WhatsApp + Web)",
            "Text, voice & image uploads",
            "Dashboard access",
        ],
        matchesPlan: (t) => t === "trial" || t === "basic",
    },
    {
        key: "pro",
        name: "Pro",
        price: "$49",
        period: "/mo",
        description: "For founders posting consistently.",
        icon: <CreditCard className="w-5 h-5" />,
        accent: "#E855A0",
        features: [
            "100 AI drafts / month",
            "Visual Context (Image-to-Post)",
            "Context Vault (product & audience info)",
            "Voice DNA learning",
            "1-click Buffer Publishing (X + LinkedIn)",
            "Full Buffer scheduling integration",
            "Email support",
        ],
        matchesPlan: (t) => t === "pro",
    },
    {
        key: "founder",
        name: "Founder",
        price: "$149",
        period: "/mo",
        description: "For high-volume thought leaders.",
        icon: <Building2 className="w-5 h-5" />,
        accent: "#f59e0b",
        features: [
            "Unlimited AI drafts",
            "Unlimited Vault entries",
            "Priority Vision processing",
            "Advanced Buffer Scheduling (pick exact send time)",
            "Custom tone fine-tuning",
            "Dedicated Slack channel",
            "Team seats (3 users)",
            "White-glove onboarding",
        ],
        matchesPlan: (t) => t === "founder",
    },
];

interface Props {
    used: number;
    usagePct: number;
    currentTier: string;
    success: boolean;
    bufferConnected: boolean;
}

export function BillingClient({ used, usagePct, currentTier, success, bufferConnected }: Props) {
    const [isPending, startTransition] = useTransition();

    function handleUpgrade(tierKey: string) {
        startTransition(async () => {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tier: tierKey }),
            });
            const text = await res.text();
            if (!text) {
                alert("Checkout failed: empty server response (status " + res.status + ")");
                return;
            }
            const { url, error } = JSON.parse(text) as { url?: string; error?: string };
            if (error || !url) {
                alert("Checkout error: " + (error ?? "No URL returned"));
                return;
            }
            window.location.href = url;
        });
    }

    return (
        <>
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-4 rounded-2xl"
                        style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)" }}
                    >
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-green-900">Payment successful — welcome to the next level.</p>
                            <p className="text-xs text-green-700/70 mt-0.5">Your plan has been upgraded. All features are now unlocked.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Usage meter */}
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-white">
                            {currentTier === "trial" || currentTier === "basic"
                                ? "Free Plan Usage"
                                : `${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan`}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                            {currentTier === "pro" || currentTier === "founder"
                                ? "Unlimited drafts included"
                                : `${used} of ${FREE_LIMIT} drafts used this month`}
                        </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#6366f1]/10 text-[#818cf8] border border-[#6366f1]/20 font-medium capitalize">
                        {currentTier === "trial" || currentTier === "basic" ? "Free" : currentTier}
                    </span>
                </div>

                {(currentTier === "trial" || currentTier === "basic") && (
                    <>
                        <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${usagePct}%`,
                                    background: usagePct >= 90
                                        ? "linear-gradient(90deg, #ef4444, #f97316)"
                                        : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                                }}
                            />
                        </div>
                        {usagePct >= 80 && (
                            <p className="text-xs text-amber-400">
                                {"You're approaching your free limit. Upgrade to keep generating drafts."}
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Pricing tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TIERS.map((tier) => {
                    const isCurrent = tier.matchesPlan(currentTier);
                    const isUpgrade = !isCurrent && tier.key !== "free";

                    return (
                        <div
                            key={tier.key}
                            className={`glass-card rounded-2xl p-6 flex flex-col gap-5 relative ${isCurrent ? "ring-1 ring-[#6366f1]/30" : ""}`}
                        >
                            {isCurrent && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                                    {bufferConnected && tier.key !== "free" && (
                                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            Buffer
                                        </span>
                                    )}
                                    <div className="text-[10px] px-2 py-0.5 rounded-full bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/20 font-medium">
                                        Active
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `${tier.accent}18`, color: tier.accent }}
                                >
                                    {tier.icon}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-white">{tier.name}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{tier.description}</p>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">{tier.price}</span>
                                <span className="text-sm text-white/30">{tier.period}</span>
                            </div>

                            <ul className="flex flex-col gap-2 flex-1">
                                {tier.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                                        <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: tier.accent }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={isCurrent || isPending}
                                onClick={() => isUpgrade && handleUpgrade(tier.key)}
                                className="w-full h-10 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-default"
                                style={isCurrent || !isUpgrade ? {
                                    background: "rgba(255,255,255,0.05)",
                                    color: "rgba(255,255,255,0.4)",
                                } : {
                                    background: `${tier.accent}20`,
                                    color: tier.accent,
                                    border: `1px solid ${tier.accent}40`,
                                }}
                            >
                                {isPending ? "Redirecting…" : isCurrent ? "Current Plan" : `Upgrade to ${tier.name}`}
                            </button>
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-gray-400 text-center">
                Payments powered by Stripe. Cancel anytime. No lock-in.
            </p>
        </>
    );
}
