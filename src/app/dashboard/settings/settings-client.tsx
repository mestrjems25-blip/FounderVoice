"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Bell, Linkedin, MessageCircle, Trash2, Unlink, Zap } from "lucide-react";
import {
    deleteAccount,
    deleteAllData,
    disconnectWhatsApp,
    generateWhatsAppLink,
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
}

export function SettingsClient({ whatsappNotifications: initialWhatsapp, phoneNumber: initialPhone }: Props) {
    const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
    const [autoPublish, setAutoPublish] = useState(false);
    const [linkedinSync, setLinkedinSync] = useState(false);
    const [phone, setPhone] = useState<string | null>(initialPhone);
    const [confirmDisconnect, setConfirmDisconnect] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmWipe, setConfirmWipe] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleWhatsappToggle(v: boolean) {
        setWhatsapp(v);
        startTransition(async () => {
            await updateSettings(v);
        });
    }

    function handleConnect() {
        startTransition(async () => {
            const url = await generateWhatsAppLink();
            window.open(url, "_blank");
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

            {/* WhatsApp Connection */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
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
                                Send voice notes to this number to generate drafts.
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-white/60">No WhatsApp number connected.</p>
                            <p className="text-xs text-white/40 mt-0.5">
                                Connect your number to send voice notes and generate LinkedIn drafts.
                            </p>
                        </div>
                        <button
                            onClick={handleConnect}
                            disabled={isPending}
                            className="text-xs px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 text-white bg-[#25D366]/20 border border-[#25D366]/30 hover:bg-[#25D366]/30 shrink-0"
                        >
                            <MessageCircle className="w-3 h-3" />
                            {isPending ? "Generating link…" : "Connect WhatsApp"}
                        </button>
                    </div>
                )}
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
                <ToggleRow
                    icon={<Linkedin className="w-4 h-4" />}
                    label="LinkedIn Auto-Sync"
                    description="Connect LinkedIn to publish directly without leaving the dashboard."
                    enabled={linkedinSync}
                    onChange={setLinkedinSync}
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

                {/* Delete all data */}
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

                {/* Delete account */}
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
