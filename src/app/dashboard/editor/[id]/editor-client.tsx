"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft, Send, Save, Trash2, Linkedin, RotateCcw,
    Sparkles, Copy, Check, Twitter, Pencil, ChevronDown, Loader2, Calendar, X,
} from "lucide-react";
import Link from "next/link";
import { SocialPreview } from "@/components/ui/social-preview";
import { saveDraftEdit } from "@/app/dashboard/actions";

interface EditorDraft {
    id: string;
    rawTranscript: string;
    aiOutput: string;
    status: string;
    variationType: string | null;
}

const TONE_OPTIONS = [
    {
        label: "Brutal Edit",
        instruction: "Cut this by 40%. Remove every redundant word, qualifier, and throat-clearing sentence. Keep only the sharpest, most impactful lines. No filler. No softening.",
    },
    {
        label: "X-Factor Thread",
        instruction: "Rewrite as a 5–7 part Twitter/X thread. Tweet 1 is a standalone hook that stops the scroll. Tweets 2–6 each deliver one concrete insight. Final tweet is a strong declaration or CTA. Each tweet under 280 characters, numbered.",
    },
    {
        label: "Deep Dive",
        instruction: "Expand this into a detailed long-form LinkedIn post. Add step-by-step how-to specifics, concrete examples from the transcript, and an actionable takeaway for each main point. This should read like a mini lesson, not a brag.",
    },
];

const LINKEDIN_LIMIT = 3000;

function localDatetimeMin(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
}

export function EditorClient({ draft }: { draft: EditorDraft }) {
    const router = useRouter();
    const [aiOutput, setAiOutput] = useState(draft.aiOutput);
    const [copied, setCopied] = useState(false);
    const [rightTab, setRightTab] = useState<"edit" | "linkedin" | "twitter">("edit");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);
    const [publishingX, setPublishingX] = useState(false);
    const [publishedX, setPublishedX] = useState(false);
    const [publishErrorX, setPublishErrorX] = useState<string | null>(null);
    const [showScheduleLinkedIn, setShowScheduleLinkedIn] = useState(false);
    const [scheduleDateLinkedIn, setScheduleDateLinkedIn] = useState("");
    const [schedulingLinkedIn, setSchedulingLinkedIn] = useState(false);
    const [scheduledLinkedIn, setScheduledLinkedIn] = useState(false);
    const [showScheduleX, setShowScheduleX] = useState(false);
    const [scheduleDateX, setScheduleDateX] = useState("");
    const [schedulingX, setSchedulingX] = useState(false);
    const [scheduledX, setScheduledX] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [showToneMenu, setShowToneMenu] = useState(false);

    const toneMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showToneMenu) return;
        function handleClickOutside(e: MouseEvent) {
            if (toneMenuRef.current && !toneMenuRef.current.contains(e.target as Node)) {
                setShowToneMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showToneMenu]);

    const charCount = aiOutput.length;
    const charPercent = Math.min((charCount / LINKEDIN_LIMIT) * 100, 100);

    function handleCopy() {
        navigator.clipboard.writeText(aiOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleSave() {
        setSaving(true);
        try {
            await saveDraftEdit(draft.id, aiOutput);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setSaving(false);
        }
    }

    async function handlePublish() {
        setPublishing(true);
        setPublishError(null);
        try {
            const res = await fetch("/api/publish/buffer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: aiOutput, platform: "linkedin" }),
            });
            const body = await res.json() as { error?: string };
            if (!res.ok) throw new Error(body.error ?? "Failed to publish");
            setPublished(true);
            setTimeout(() => setPublished(false), 3000);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to publish";
            setPublishError(msg);
            setTimeout(() => setPublishError(null), 6000);
        } finally {
            setPublishing(false);
        }
    }

    async function handlePublishToX() {
        setPublishingX(true);
        setPublishErrorX(null);
        try {
            const res = await fetch("/api/publish/buffer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: aiOutput, platform: "twitter" }),
            });
            const body = await res.json() as { error?: string };
            if (!res.ok) throw new Error(body.error ?? "Failed to publish");
            setPublishedX(true);
            setTimeout(() => setPublishedX(false), 3000);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to publish";
            setPublishErrorX(msg);
            setTimeout(() => setPublishErrorX(null), 6000);
        } finally {
            setPublishingX(false);
        }
    }

    async function handleScheduleLinkedIn() {
        if (!scheduleDateLinkedIn) return;
        setSchedulingLinkedIn(true);
        setPublishError(null);
        try {
            const res = await fetch("/api/publish/buffer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: aiOutput,
                    platform: "linkedin",
                    scheduledAt: new Date(scheduleDateLinkedIn).toISOString(),
                    draftId: draft.id,
                }),
            });
            const body = await res.json() as { error?: string };
            if (!res.ok) throw new Error(body.error ?? "Failed to schedule");
            setScheduledLinkedIn(true);
            setShowScheduleLinkedIn(false);
            setTimeout(() => setScheduledLinkedIn(false), 4000);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to schedule";
            setPublishError(msg);
            setTimeout(() => setPublishError(null), 6000);
        } finally {
            setSchedulingLinkedIn(false);
        }
    }

    async function handleScheduleX() {
        if (!scheduleDateX) return;
        setSchedulingX(true);
        setPublishErrorX(null);
        try {
            const res = await fetch("/api/publish/buffer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: aiOutput,
                    platform: "twitter",
                    scheduledAt: new Date(scheduleDateX).toISOString(),
                    draftId: draft.id,
                }),
            });
            const body = await res.json() as { error?: string };
            if (!res.ok) throw new Error(body.error ?? "Failed to schedule");
            setScheduledX(true);
            setShowScheduleX(false);
            setTimeout(() => setScheduledX(false), 4000);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to schedule";
            setPublishErrorX(msg);
            setTimeout(() => setPublishErrorX(null), 6000);
        } finally {
            setSchedulingX(false);
        }
    }

    async function handleRegenerate() {
        setRegenerating(true);
        try {
            const res = await fetch("/api/drafts/regenerate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    draftId: draft.id,
                    instruction: "Rewrite this post completely fresh. Keep the same core insight from the transcript but find a new hook, new angle, and new structure. Make it feel like a totally different post.",
                }),
            });
            const data = await res.json();
            if (res.ok && data.aiOutput) setAiOutput(data.aiOutput);
        } finally {
            setRegenerating(false);
        }
    }

    async function handleChangeTone(instruction: string) {
        setShowToneMenu(false);
        setRegenerating(true);
        try {
            const res = await fetch("/api/drafts/regenerate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ draftId: draft.id, instruction }),
            });
            const data = await res.json();
            if (res.ok && data.aiOutput) setAiOutput(data.aiOutput);
        } finally {
            setRegenerating(false);
        }
    }

    return (
        <div>
            {/* Toolbar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
            >
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-gray-900">Edit Draft</h1>
                        <p className="text-xs text-gray-500">
                            Refine the AI output before publishing to LinkedIn
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/dashboard")}
                        className="gap-1.5 rounded-xl border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100 h-9"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Discard
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        className="gap-1.5 rounded-xl border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100 h-9 disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : saved ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <Save className="w-3.5 h-3.5" />
                        )}
                        {saved ? "Saved" : saving ? "Saving…" : "Save Draft"}
                    </Button>
                    <Button
                        size="sm"
                        onClick={handlePublish}
                        disabled={publishing}
                        className="glow-button gap-1.5 text-white border-0 rounded-xl h-9 px-5 disabled:opacity-60"
                        style={{ background: "#6366f1" }}
                    >
                        {published ? (
                            <><Check className="w-3.5 h-3.5" /> Queued in Buffer</>
                        ) : (
                            <><Linkedin className="w-3.5 h-3.5" /> {publishing ? "Publishing…" : "Post to LinkedIn"}</>
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* Editor panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Raw Input */}
                <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
                >
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                                Raw Input
                            </span>
                        </div>
                        {draft.variationType && (
                            <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-500 border-0">
                                {draft.variationType.replace("_", " ")}
                            </Badge>
                        )}
                    </div>
                    <div className="p-5">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                            {draft.rawTranscript || "(no transcript)"}
                        </p>
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            className="gap-1.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 h-7 disabled:opacity-50"
                        >
                            {regenerating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <RotateCcw className="w-3 h-3" />
                            )}
                            Re-generate
                        </Button>

                        <div className="relative" ref={toneMenuRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowToneMenu((v) => !v)}
                                disabled={regenerating}
                                className="gap-1.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 h-7 disabled:opacity-50"
                            >
                                <Sparkles className="w-3 h-3" />
                                Change Tone
                                <ChevronDown className="w-3 h-3" />
                            </Button>
                            {showToneMenu && (
                                <div className="absolute bottom-full mb-1.5 left-0 w-52 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg z-20">
                                    {TONE_OPTIONS.map(({ label, instruction }) => (
                                        <button
                                            key={label}
                                            onClick={() => handleChangeTone(instruction)}
                                            className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Right: AI Output — dark AI card */}
                <motion.div
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-2xl overflow-hidden flex flex-col relative"
                    style={{
                        background: "#0d0d14",
                        border: "1px solid rgba(99,102,241,0.22)",
                        boxShadow: "0 0 50px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                >
                    {/* Subtle dot-grid texture */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
                            backgroundSize: "22px 22px",
                        }}
                    />

                    {/* Ambient top glow */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
                    />

                    {/* Header */}
                    <div className="relative flex items-center gap-1 px-4 py-2.5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2 mr-2">
                            <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: "rgba(99,102,241,0.18)" }}
                            >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                                AI Output
                            </span>
                        </div>

                        <button
                            onClick={() => setRightTab("edit")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                rightTab === "edit"
                                    ? "bg-[#6366f1]/20 text-indigo-300"
                                    : "text-white/30 hover:text-white/60"
                            }`}
                        >
                            <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                            onClick={() => setRightTab("linkedin")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                rightTab === "linkedin"
                                    ? "bg-blue-500/15 text-blue-300"
                                    : "text-white/30 hover:text-white/60"
                            }`}
                        >
                            <Linkedin className="w-3 h-3" /> LinkedIn
                        </button>
                        <button
                            onClick={() => setRightTab("twitter")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                rightTab === "twitter"
                                    ? "bg-white/10 text-white/80"
                                    : "text-white/30 hover:text-white/60"
                            }`}
                        >
                            <Twitter className="w-3 h-3" /> X
                        </button>

                        <div className="ml-auto">
                            <button
                                onClick={handleCopy}
                                className="text-xs text-white/30 hover:text-white/70 flex items-center gap-1 transition-colors"
                            >
                                {copied ? (
                                    <><Check className="w-3 h-3 text-emerald-400" /> Copied</>
                                ) : (
                                    <><Copy className="w-3 h-3" /> Copy</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 overflow-y-auto">
                        {rightTab === "edit" ? (
                            <div className="p-5">
                                {regenerating ? (
                                    <div className="space-y-3 animate-pulse pt-1">
                                        {[88, 72, 90, 55, 78, 65, 42].map((w, i) => (
                                            <div
                                                key={i}
                                                className="h-3.5 rounded-full"
                                                style={{
                                                    width: `${w}%`,
                                                    background: "rgba(99,102,241,0.12)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <Textarea
                                        value={aiOutput}
                                        onChange={(e) => setAiOutput(e.target.value)}
                                        className="min-h-[300px] bg-transparent border-0 text-sm text-white/85 leading-[1.8] p-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/20"
                                        style={{ caretColor: "#818cf8" }}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="p-4">
                                <SocialPreview
                                    text={aiOutput}
                                    mode={rightTab}
                                    onClose={() => setRightTab("edit")}
                                    inline
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer: Edit */}
                    {rightTab === "edit" && (
                        <div className="relative px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-white/30">
                                    {charCount.toLocaleString()} / {LINKEDIN_LIMIT.toLocaleString()}
                                </span>
                                <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${charPercent}%`,
                                            background: charPercent > 90
                                                ? "#f87171"
                                                : charPercent > 70
                                                ? "#fbbf24"
                                                : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                                        }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handlePublish}
                                disabled={publishing}
                                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white disabled:opacity-50 transition-opacity"
                                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                            >
                                {published ? (
                                    <><Check className="w-3 h-3" /> Queued</>
                                ) : (
                                    <><Send className="w-3 h-3" /> {publishing ? "Publishing…" : "Publish Now"}</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Footer: LinkedIn */}
                    {rightTab === "linkedin" && (
                        <div className="relative px-5 py-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {publishError ? (
                                    <span className="text-xs text-red-400 truncate">{publishError}</span>
                                ) : showScheduleLinkedIn ? (
                                    <>
                                        <input
                                            type="datetime-local"
                                            value={scheduleDateLinkedIn}
                                            onChange={(e) => setScheduleDateLinkedIn(e.target.value)}
                                            min={localDatetimeMin()}
                                            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-indigo-500/50 w-44"
                                            style={{ color: "rgba(255,255,255,0.7)", colorScheme: "dark" }}
                                        />
                                        <button
                                            onClick={() => { setShowScheduleLinkedIn(false); setScheduleDateLinkedIn(""); }}
                                            className="text-white/30 hover:text-white/60 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setShowScheduleLinkedIn(true)}
                                        className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        <Calendar className="w-3 h-3" /> Schedule
                                    </button>
                                )}
                            </div>
                            {showScheduleLinkedIn ? (
                                <button
                                    onClick={handleScheduleLinkedIn}
                                    disabled={!scheduleDateLinkedIn || schedulingLinkedIn}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white disabled:opacity-50 shrink-0"
                                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                                >
                                    {scheduledLinkedIn ? (
                                        <><Check className="w-3 h-3" /> Scheduled</>
                                    ) : schedulingLinkedIn ? "Scheduling…" : "Confirm"}
                                </button>
                            ) : (
                                <button
                                    onClick={handlePublish}
                                    disabled={publishing}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white disabled:opacity-50 shrink-0"
                                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                                >
                                    {published ? (
                                        <><Check className="w-3 h-3" /> Queued in Buffer</>
                                    ) : (
                                        <><Linkedin className="w-3 h-3" /> {publishing ? "Publishing…" : "Post to LinkedIn"}</>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Footer: X */}
                    {rightTab === "twitter" && (
                        <div className="relative px-5 py-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {publishErrorX ? (
                                    <span className="text-xs text-red-400 truncate">{publishErrorX}</span>
                                ) : showScheduleX ? (
                                    <>
                                        <input
                                            type="datetime-local"
                                            value={scheduleDateX}
                                            onChange={(e) => setScheduleDateX(e.target.value)}
                                            min={localDatetimeMin()}
                                            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-white/30 w-44"
                                            style={{ color: "rgba(255,255,255,0.7)", colorScheme: "dark" }}
                                        />
                                        <button
                                            onClick={() => { setShowScheduleX(false); setScheduleDateX(""); }}
                                            className="text-white/30 hover:text-white/60 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setShowScheduleX(true)}
                                        className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        <Calendar className="w-3 h-3" /> Schedule
                                    </button>
                                )}
                            </div>
                            {showScheduleX ? (
                                <button
                                    onClick={handleScheduleX}
                                    disabled={!scheduleDateX || schedulingX}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white disabled:opacity-50 shrink-0"
                                    style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.12)" }}
                                >
                                    {scheduledX ? (
                                        <><Check className="w-3 h-3" /> Scheduled</>
                                    ) : schedulingX ? "Scheduling…" : "Confirm"}
                                </button>
                            ) : (
                                <button
                                    onClick={handlePublishToX}
                                    disabled={publishingX}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white disabled:opacity-50 shrink-0"
                                    style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.12)" }}
                                >
                                    {publishedX ? (
                                        <><Check className="w-3 h-3" /> Queued in Buffer</>
                                    ) : (
                                        <><Twitter className="w-3 h-3" /> {publishingX ? "Publishing…" : "Send to X"}</>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
