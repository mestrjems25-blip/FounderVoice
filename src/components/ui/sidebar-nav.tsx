"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FileText,
    Mic,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    User,
    CreditCard,
    Menu,
    X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "@/app/auth/actions";

const navItems = [
    { href: "/dashboard", label: "Drafts", icon: FileText },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/voice-profile", label: "Voice Profile", icon: Mic },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const FREE_LIMIT = 10;

const PLAN_LABELS: Record<string, string> = {
    trial: "Free Plan",
    basic: "Free Plan",
    pro: "Pro Plan",
    founder: "Founder Plan",
};

interface SidebarProps {
    tier?: string;
    draftCount?: number;
}

export function Sidebar({ tier = "trial", draftCount = 0 }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isPaid = tier === "pro" || tier === "founder";
    const usagePct = Math.min((draftCount / FREE_LIMIT) * 100, 100);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#100F11] shrink-0 shadow-sm z-30">
                <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-white/70 hover:text-white transition-colors">
                    <Menu className="w-5 h-5" />
                </button>
                <Link href="/dashboard" className="text-lg font-bold tracking-tight" style={{ color: "#E855A0" }}>
                    FounderVoice
                </Link>
                <div className="w-9" />
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                animate={{ width: collapsed ? 72 : 260 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`fixed md:relative inset-y-0 left-0 flex flex-col h-full border-r border-white/5 bg-[#100F11] shrink-0 z-50 transform transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-center px-5 py-5 border-b border-white/5 h-[68px]">
                    <AnimatePresence mode="wait">
                        {!collapsed ? (
                            <motion.span
                                key="expanded"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-lg font-bold tracking-tight whitespace-nowrap"
                                style={{ color: "#E855A0" }}
                            >
                                FounderVoice
                            </motion.span>
                        ) : (
                            <motion.span
                                key="collapsed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-lg font-bold tracking-tight"
                                style={{ color: "#E855A0" }}
                            >
                                FV
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav */}
                <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden ${isActive
                                        ? "text-white bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                                        : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-[#6366f1] to-[#8b5cf6]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon
                                    className={`w-4 h-4 shrink-0 ${isActive ? "text-[#818cf8]" : "group-hover:text-white/80"}`}
                                />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="border-t border-white/5 px-3 py-4 flex flex-col gap-1">
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="glass-card rounded-xl p-4 mb-3 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/0 to-[#8b5cf6]/0 group-hover:from-[#6366f1]/5 group-hover:to-[#8b5cf6]/5 transition-all duration-500" />
                                <p className="text-xs font-medium text-white/70 mb-2 relative z-10">
                                    {PLAN_LABELS[tier] ?? "Free Plan"}
                                </p>
                                {isPaid ? (
                                    <p className="text-xs text-white/30">Unlimited drafts</p>
                                ) : (
                                    <>
                                        <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                                            <div
                                                className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] h-1.5 rounded-full transition-all duration-700"
                                                style={{ width: `${usagePct}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-white/30">{draftCount} of {FREE_LIMIT} drafts used</p>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form action={signOut}>
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 hover:text-white hover:bg-white/[0.03] transition-all"
                        >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="whitespace-nowrap"
                                    >
                                        Sign Out
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </form>
                </div>

                {/* Collapse toggle (Desktop only) */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden md:flex absolute -right-3 top-[84px] w-6 h-6 rounded-full bg-[#161616] border border-white/10 items-center justify-center hover:bg-[#1e1e1e] transition-colors z-10"
                >
                    <ChevronLeft
                        className={`w-3 h-3 text-white/40 transition-transform ${collapsed ? "rotate-180" : ""}`}
                    />
                </button>
                {/* Close toggle (Mobile only) */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden absolute right-4 top-5 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/50"
                >
                    <X className="w-4 h-4" />
                </button>
            </motion.aside>
        </>
    );
}
