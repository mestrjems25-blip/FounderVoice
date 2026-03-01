"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Check, Linkedin, Phone, User, Brain } from "lucide-react";
import { updateProfile, updateVoiceDna } from "@/app/dashboard/actions";

interface Props {
    fullName: string;
    linkedinUrl: string;
    phoneNumber: string | null;
    email: string;
    voiceDna: string;
}

export function ProfileForm({ fullName, linkedinUrl, phoneNumber, email, voiceDna }: Props) {
    const [name, setName] = useState(fullName);
    const [linkedin, setLinkedin] = useState(linkedinUrl);
    const [dna, setDna] = useState(voiceDna);
    const [saved, setSaved] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleSave() {
        startTransition(async () => {
            await Promise.all([
                updateProfile(name.trim(), linkedin.trim()),
                updateVoiceDna(dna.trim()),
            ]);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 flex flex-col gap-6"
        >
            {/* Email (read-only) */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-medium text-white/40">
                    Email
                </label>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <User className="w-3.5 h-3.5 text-white/20 shrink-0" />
                    <span className="text-sm text-white/40">{email}</span>
                </div>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-medium text-white/40">
                    Full Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Lamine Diallo"
                    className="px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#6366f1]/60 transition-colors"
                />
            </div>

            {/* LinkedIn URL */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-medium text-white/40">
                    LinkedIn Profile URL
                </label>
                <div className="relative">
                    <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                    <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#6366f1]/60 transition-colors"
                    />
                </div>
            </div>

            {/* WhatsApp number (read-only) */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-medium text-white/40">
                    WhatsApp Number
                </label>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <Phone className="w-3.5 h-3.5 text-white/20 shrink-0" />
                    <span className="text-sm text-white/40">
                        {phoneNumber ?? "Not linked — send a voice note on WhatsApp to register"}
                    </span>
                    {phoneNumber && (
                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#4ade80] border border-[#22c55e]/20">
                            Verified
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-white/20">Your number is set automatically when you first message the WhatsApp sandbox.</p>
            </div>

            {/* Voice DNA */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-[#818cf8]" />
                    <label className="text-[10px] uppercase tracking-widest font-medium text-white/40">
                        Voice DNA
                    </label>
                </div>
                <p className="text-xs text-white/30">
                    Describe your writing style in plain language. The AI reads this before every draft.
                </p>
                <textarea
                    value={dna}
                    onChange={(e) => setDna(e.target.value)}
                    rows={5}
                    placeholder={`Examples:\n• I hate buzzwords like "synergy" and "leverage"\n• Short punchy sentences. No fluff.\n• I always end with a question to drive comments\n• I mention real numbers — ARR, churn rate, headcount\n• Never use exclamation marks`}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#818cf8]/60 transition-colors resize-none leading-relaxed"
                />
                <p className="text-[10px] text-white/20">
                    {dna.length} characters — more detail = better output. Aim for 100–300 characters.
                </p>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 pt-1">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="glow-button bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl h-10 px-6 text-sm font-medium disabled:opacity-60 transition-opacity"
                >
                    {isPending ? "Saving…" : "Save Profile"}
                </button>
                {saved && (
                    <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1.5 text-sm text-[#4ade80]"
                    >
                        <Check className="w-4 h-4" /> Saved
                    </motion.span>
                )}
            </div>
        </motion.div>
    );
}
