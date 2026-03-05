"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, CheckCircle2, Linkedin, MessageCircle, RefreshCw, Trash2, Unlink, Zap } from "lucide-react";
import {
    deleteAccount,
    deleteAllData,
    disconnectWhatsApp,
    generateWhatsAppLink,
    refreshSocialStatus,
    updateSettings,
} from "@/app/dashboard/actions";

interface ToggleRowProps {
    icon: React.ReactNode;
    label: string;
    description: string;
    enabled: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    badge?: string;
}

function ToggleRow({ icon, label, description, enabled, onChange, disabled, badge }: ToggleRowProps) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 shrink-0 mt-0.5">
                    {icon}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{label}</p>
                        {badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{description}</p>
                </div>
            </div>
            <button
                role="switch"
                aria-checked={enabled}
                disabled={disabled}
                onClick={() => onChange(!enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed ${
                    enabled ? "bg-[#6366f1]" : "bg-white/10"
                }`}
            >
                <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                        enabled ? "left-6" : "left-1"
                    }`}
                />
            </button>
        </div>
    );
}

interface Props {
    whatsappNotifications: boolean;
    phoneNumber: string | null;
    verificationToken: string;
    waLink: string;
    linkedinConnected: boolean;
    xConnected: boolean;
    socialStatus?: "connected" | "error";
}

export function SettingsClient({
    whatsappNotifications: initialWhatsapp,
    phoneNumber: initialPhone,
    verificationToken: initialToken,
    waLink: initialWaLink,
    linkedinConnected: initialLinkedin,
    xConnected: initialX,
    socialStatus,
}: Props) {
    const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
    const [autoPublish, setAutoPublish] = useState(false);
    const [phone, setPhone] = useState<string | null>(initialPhone);
    const [waLink, setWaLink] = useState(initialWaLink);
    const [token, setToken] = useState(initialToken);
    const [linkedinConnected, setLinkedinConnected] = useState(initialLinkedin);
    const [xConnected, setXConnected] = useState(initialX);
    const [socialToast, setSocialToast] = useState<"connected" | "error" | undefined>(socialStatus);
    const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const focusRef = useRef<(() => void) | null>(null);
    const [confirmDisconnect, setConfirmDisconnect] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmWipe, setConfirmWipe] = useState(false);
    const [isPending, startTransition] = useTransition();

    function clearPoll() {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        if (focusRef.current) {
            window.removeEventListener("focus", focusRef.current);
            focusRef.current = null;
        }
    }

    const handleSocialMessage = useCallback((e: MessageEvent<{ type?: string }>) => {
        if (e.data?.type === "social-connected") {
            clearPoll();
            setLinkedinConnected(true);
            setXConnected(true);
            setSocialToast("connected");
            setConnectingPlatform(null);
        }
        if (e.data?.type === "social-error") {
            clearPoll();
            setSocialToast("error");
            setConnectingPlatform(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        window.addEventListener("message", handleSocialMessage);
        return () => {
            window.removeEventListener("message", handleSocialMessage);
            clearPoll();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleSocialMessage]);

    function connectSocial(platforms: string) {
        setConnectingPlatform(platforms);
        const popup = window.open(
            `/api/auth/social/connect?platforms=${platforms}`,
            "social-connect",
            "width=600,height=700,left=200,top=100,toolbar=0,menubar=0,location=0"
        );
        if (!popup) {
            window.location.href = `/api/auth/social/connect?platforms=${platforms}`;
            return;
        }

        // Returns true if we detected a connection and cleaned up.
        async function syncAndCheck(popupClosed: boolean): Promise<boolean> {
            const status = await refreshSocialStatus();
            if (status.linkedin) setLinkedinConnected(true);
            if (status.x) setXConnected(true);
            if (status.linkedin || status.x) {
                clearPoll();
                setConnectingPlatform(null);
                setSocialToast("connected");
                return true;
            }
            if (popupClosed) {
                clearPoll();
                setConnectingPlatform(null);
            }
            return false;
        }

        // When the user tabs back from the OAuth popup, check immediately.
        const onFocus = () => {
            setTimeout(() => syncAndCheck(popup.closed), 800);
        };
        focusRef.current = onFocus;
        window.addEventListener("focus", onFocus);

        const deadline = Date.now() + 2 * 60 * 1000;
        pollRef.current = setInterval(async () => {
            if (Date.now() > deadline) {
                clearPoll();
                setConnectingPlatform(null);
                return;
            }
            await syncAndCheck(popup.closed);
        }, 5000);
    }

    function handleWhatsappToggle(v: boolean) {
        setWhatsapp(v);
        startTransition(async () => {
            await updateSettings(v);
        });
    }

    function handleVerify() {
        window.open(waLink, "_blank");
    }

    function handleRegenerate() {
        startTransition(async () => {
            const newLink = await generateWhatsAppLink();
            setWaLink(newLink);
            // Extract the new 6-char token from the wa.me link
            const match = decodeURIComponent(newLink).match(/Verify my account:\s*([0-9a-f]{6})/i);
            if (match) setToken(match[1]);
        });
    }

    function handleDisconnect() {
        if (!confirmDisconnect) {
            setConfirmDisconnect(true);
            return;
        }
        startTransition(async () => {
            await disconnectWhatsApp();
            setPhone(null);
            setConfirmDisconnect(false);
        });
    }

    function handleDeleteAll() {
        if (!confirmWipe) {
            setConfirmWipe(true);
            return;
        }
        startTransition(async () => {
            await deleteAllData();
            setConfirmWipe(false);
        });
    }

    function handleDeleteAccount() {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        startTransition(async () => {
            await deleteAccount();
        });
    }

    return (
        <div className="flex flex-col gap-8 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Preferences and account controls.</p>
            </div>

            {/* Social connection status toast */}
            <AnimatePresence>
                {socialToast === "connected" && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-4 rounded-2xl"
                        style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)" }}
                    >
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        <p className="text-sm text-green-300">Success! Your accounts are linked — drafts will now publish directly from your dashboard.</p>
                    </motion.div>
                )}
                {socialToast === "error" && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-4 rounded-2xl"
                        style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)" }}
                    >
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <p className="text-sm text-red-300">Connection failed. Make sure you approved access and try again.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* WhatsApp Connection */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <p className="text-sm font-semibold text-white">WhatsApp Connection</p>
                </div>

                {phone ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-white">
                                Connected:{" "}
                                <span className="font-mono text-[#25D366]">{phone}</span>
                            </p>
                            <p className="text-xs text-white/40 mt-0.5">
                                Send voice notes, text, or photos to generate LinkedIn drafts.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {confirmDisconnect && !isPending && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setConfirmDisconnect(false)}
                                    className="text-xs px-3 py-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </motion.button>
                            )}
                            <button
                                onClick={handleDisconnect}
                                disabled={isPending}
                                className="text-xs px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 text-white/50 bg-white/5 border border-white/10 hover:bg-white/10"
                            >
                                <Unlink className="w-3 h-3" />
                                {isPending ? "Disconnecting…" : confirmDisconnect ? "Yes, disconnect" : "Disconnect"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {/* Verification code display */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/3 border border-white/8">
                            <div>
                                <p className="text-xs text-white/40 mb-1.5">Your verification code</p>
                                <p className="font-mono text-3xl font-bold tracking-[0.3em] text-white">
                                    {token}
                                </p>
                            </div>
                            <button
                                onClick={handleRegenerate}
                                disabled={isPending}
                                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors disabled:opacity-30 shrink-0"
                            >
                                <RefreshCw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
                                New code
                            </button>
                        </div>

                        {/* Instructions + CTA */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <p className="text-xs text-white/40 leading-relaxed">
                                Tap the button to open WhatsApp. The message is pre-filled — just hit send.
                            </p>
                            <button
                                onClick={handleVerify}
                                disabled={isPending}
                                className="text-sm px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 text-white bg-[#25D366]/20 border border-[#25D366]/30 hover:bg-[#25D366]/30 shrink-0"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Verify on WhatsApp
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Social Accounts */}
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-[#818cf8]" />
                    <p className="text-sm font-semibold text-white">Social Accounts</p>
                    <button
                        onClick={async () => {
                            const status = await refreshSocialStatus();
                            if (status.linkedin) setLinkedinConnected(true);
                            if (status.x) setXConnected(true);
                            if (status.linkedin || status.x) setSocialToast("connected");
                        }}
                        className="ml-auto flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                        title="Refresh connection status"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Refresh
                    </button>
                </div>

                {(
                    [
                        { key: "linkedin", label: "LinkedIn", description: "Publish drafts directly to your LinkedIn profile.", isConnected: linkedinConnected },
                        { key: "x", label: "X (Twitter)", description: "Publish threads and posts directly to X.", isConnected: xConnected },
                    ] as const
                ).map(({ key, label, description, isConnected }, i, arr) => (
                    <div
                        key={key}
                        className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white">{label}</p>
                                {isConnected && (
                                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        Connected
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-white/40 mt-0.5">{description}</p>
                        </div>
                        <button
                            onClick={() => connectSocial(key)}
                            disabled={connectingPlatform === key}
                            className="text-xs px-4 py-2 rounded-lg font-medium transition-all shrink-0 disabled:opacity-70 flex items-center gap-1.5"
                            style={{
                                background: isConnected ? "rgba(34,197,94,0.08)" : "rgba(99,102,241,0.12)",
                                color: isConnected ? "#4ade80" : "#818cf8",
                                border: `1px solid ${isConnected ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.2)"}`,
                            }}
                        >
                            {connectingPlatform === key && (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                            )}
                            {connectingPlatform === key ? "Preparing secure connection…" : isConnected ? "✓ Connected" : "Connect"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Preferences */}
            <div className="glass-card rounded-2xl px-6 py-2">
                <ToggleRow
                    icon={<Bell className="w-4 h-4" />}
                    label="WhatsApp Notifications"
                    description="Receive a WhatsApp message when your drafts are ready."
                    enabled={whatsapp}
                    onChange={handleWhatsappToggle}
                />
                <ToggleRow
                    icon={<Zap className="w-4 h-4" />}
                    label="Auto-Publish"
                    description="Automatically publish the highest-scoring draft after generation."
                    enabled={autoPublish}
                    onChange={setAutoPublish}
                    disabled
                    badge="Coming soon"
                />
            </div>

            {/* Danger zone */}
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-5 border border-red-500/10">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <p className="text-sm font-semibold text-red-400">Danger Zone</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
                    <div>
                        <p className="text-sm font-medium text-white">Delete All Data</p>
                        <p className="text-xs text-white/40 mt-0.5">
                            Wipes all your drafts and voice samples. Your account remains active.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {confirmWipe && !isPending && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setConfirmWipe(false)}
                                className="text-xs px-3 py-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </motion.button>
                        )}
                        <button
                            onClick={handleDeleteAll}
                            disabled={isPending}
                            className="text-xs px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-1.5"
                            style={{
                                background: confirmWipe ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.08)",
                                color: "#f87171",
                                border: "1px solid rgba(239,68,68,0.2)",
                            }}
                        >
                            <Trash2 className="w-3 h-3" />
                            {isPending ? "Deleting…" : confirmWipe ? "Yes, delete all data" : "Delete All Data"}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-white">Delete Account</p>
                        <p className="text-xs text-white/40 mt-0.5">
                            Permanently deletes your account, all drafts, and voice samples. Cannot be undone.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {confirmDelete && !isPending && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setConfirmDelete(false)}
                                className="text-xs px-3 py-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </motion.button>
                        )}
                        <button
                            onClick={handleDeleteAccount}
                            disabled={isPending}
                            className="text-xs px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                            style={{
                                background: confirmDelete ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.08)",
                                color: "#f87171",
                                border: "1px solid rgba(239,68,68,0.2)",
                            }}
                        >
                            {isPending ? "Deleting…" : confirmDelete ? "Yes, delete everything" : "Delete Account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
