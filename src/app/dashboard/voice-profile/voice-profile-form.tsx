"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateVoiceStyle, updateContextVault, type VoiceStyle } from "@/app/dashboard/actions";

const tones = ["professional", "casual", "provocative", "inspirational"] as const;
const formats = ["bullet-points", "story", "listicle", "thread"] as const;

interface Props {
    initialStyle: VoiceStyle;
    initialContextVault: string;
}

export function VoiceProfileForm({ initialStyle, initialContextVault }: Props) {
    const [style, setStyle] = useState<VoiceStyle>(initialStyle);
    const [avoidWordsRaw, setAvoidWordsRaw] = useState(
        initialStyle.avoidWords?.join(", ") ?? ""
    );
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [contextVault, setContextVault] = useState(initialContextVault);
    const [savingVault, setSavingVault] = useState(false);
    const [savedVault, setSavedVault] = useState(false);

    async function handleSave() {
        setSaving(true);
        setSaved(false);
        try {
            const payload: VoiceStyle = {
                ...style,
                avoidWords: avoidWordsRaw
                    .split(",")
                    .map((w) => w.trim())
                    .filter(Boolean),
            };
            await updateVoiceStyle(payload);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveVault() {
        setSavingVault(true);
        setSavedVault(false);
        try {
            await updateContextVault(contextVault);
            setSavedVault(true);
            setTimeout(() => setSavedVault(false), 3000);
        } finally {
            setSavingVault(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 flex flex-col gap-7"
        >
            {/* Tone */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                    Tone
                </p>
                <div className="flex flex-wrap gap-2">
                    {tones.map((t) => (
                        <button
                            key={t}
                            onClick={() => setStyle((s) => ({ ...s, tone: t }))}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${style.tone === t
                                ? "bg-[#6366f1]/20 border-[#6366f1]/60 text-[#818cf8]"
                                : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white hover:border-white/20"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Formatting */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                    Default Format
                </p>
                <div className="flex flex-wrap gap-2">
                    {formats.map((f) => (
                        <button
                            key={f}
                            onClick={() => setStyle((s) => ({ ...s, formatting: f }))}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${style.formatting === f
                                ? "bg-[#6366f1]/20 border-[#6366f1]/60 text-[#818cf8]"
                                : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white hover:border-white/20"
                                }`}
                        >
                            {f.replace("-", " ")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Signature */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                    Signature / CTA
                </p>
                <Textarea
                    placeholder='e.g. "Follow for more raw founder truths. No fluff."'
                    value={style.signature ?? ""}
                    onChange={(e) => setStyle((s) => ({ ...s, signature: e.target.value }))}
                    className="bg-white/[0.03] border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 resize-none min-h-[80px] focus-visible:ring-0 focus-visible:border-[#6366f1]/60"
                />
            </div>

            {/* Avoid Words */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                    Words to Avoid
                </p>
                <input
                    type="text"
                    placeholder="synergy, leverage, hustle, game-changer"
                    value={avoidWordsRaw}
                    onChange={(e) => setAvoidWordsRaw(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#6366f1]/60 transition-colors"
                />
                <p className="text-xs text-muted-foreground/50 mt-2">Comma-separated</p>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="glow-button bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white border-0 rounded-xl h-10 px-6 font-medium disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save Profile"}
                </Button>
                {saved && (
                    <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-sm text-green-400"
                    >
                        <Check className="w-4 h-4" /> Saved
                    </motion.span>
                )}
            </div>
        </motion.div>

        {/* Context Vault */}
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass-card rounded-2xl p-6 flex flex-col gap-5"
        >
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
                    Company Context
                </p>
                <p className="text-xs text-muted-foreground/50">
                    Paste your product description, pricing, ICP, or anything Claude should know about your business. The more specific, the more accurate your posts.
                </p>
            </div>
            <Textarea
                placeholder={"e.g. We build AI-native SaaS for operators. Our product is called Waypoint — $49/mo, targeting 1–10 person startups. ICP: technical founders who hate writing. Core value prop: replace 3 hours of content work with one 60-second voice note."}
                value={contextVault}
                onChange={(e) => setContextVault(e.target.value)}
                className="bg-white/[0.03] border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 resize-none min-h-[160px] focus-visible:ring-0 focus-visible:border-[#6366f1]/60"
            />
            <div className="flex items-center gap-3">
                <Button
                    onClick={handleSaveVault}
                    disabled={savingVault}
                    className="glow-button bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white border-0 rounded-xl h-10 px-6 font-medium disabled:opacity-60"
                >
                    {savingVault ? "Saving..." : "Save Context"}
                </Button>
                {savedVault && (
                    <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-sm text-green-400"
                    >
                        <Check className="w-4 h-4" /> Saved
                    </motion.span>
                )}
            </div>
        </motion.div>
        </div>
    );
}
