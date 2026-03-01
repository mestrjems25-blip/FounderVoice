"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, Zap } from "lucide-react";
import type { SubscriptionTier } from "@/lib/trial";

interface Props {
    tier: SubscriptionTier;
    daysRemaining: number;
}

export function TrialBanner({ tier, daysRemaining }: Props) {
    if (tier !== "trial" && tier !== "basic") return null;

    const isBasic = tier === "basic";
    const isUrgent = !isBasic && daysRemaining <= 2;
    const pct = isBasic ? 0 : Math.round((daysRemaining / 7) * 100);

    const barColor = isUrgent
        ? "linear-gradient(90deg, #ef4444, #f97316)"
        : "linear-gradient(90deg, #eab308, #f59e0b)";

    const borderColor = isBasic
        ? "rgba(239,68,68,0.2)"
        : "rgba(234,179,8,0.35)";

    const bgColor = isBasic
        ? "rgba(239,68,68,0.07)"
        : "rgba(234,179,8,0.12)";

    const upgradeStyle = {
        background: isBasic ? "rgba(239,68,68,0.12)" : "rgba(234,179,8,0.18)",
        color: isBasic ? "#f87171" : "#92400e",
        border: `1px solid ${isBasic ? "rgba(239,68,68,0.25)" : "rgba(234,179,8,0.5)"}`,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 rounded-2xl p-4 flex items-center gap-4"
            style={{ background: bgColor, border: `1px solid ${borderColor}` }}
        >
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                    background: isBasic ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                    color: isBasic ? "#f87171" : "#fbbf24",
                }}
            >
                {isBasic ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
                {isBasic ? (
                    <>
                        <p className="text-sm font-medium" style={{ color: "#7f1d1d" }}>Your trial has ended</p>
                        <p className="text-xs mt-0.5" style={{ color: "#991b1b" }}>
                            X-Factor and Deep Dive posts are locked. Upgrade to unlock all features and unlimited drafts.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium" style={{ color: "#78350f" }}>
                                {daysRemaining === 0
                                    ? "Trial expires today"
                                    : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left in your free trial`}
                            </p>
                            <span className="text-[10px] ml-4 shrink-0" style={{ color: "#92400e" }}>{pct}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(120,53,15,0.15)" }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                className="h-full rounded-full"
                                style={{ background: barColor }}
                            />
                        </div>
                    </>
                )}
            </div>

            <Link
                href="/dashboard/billing"
                className="shrink-0 text-xs font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap"
                style={upgradeStyle}
            >
                <Zap className="w-3 h-3" />
                Upgrade
            </Link>
        </motion.div>
    );
}
