"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
    Clock, FileText, ArrowUpRight, Send, Check,
    Copy, Pencil, Volume2, ImageIcon, X, Save, RefreshCw, Eye,
} from "lucide-react";
import { publishDraft, saveDraftEdit } from "@/app/dashboard/actions";
import { SocialPreview } from "@/components/ui/social-preview";

export interface Draft {
    id: string;
    rawTranscript: string;
    aiOutput: string;
    variationType?: string | null;
    sourceAudioUrl?: string | null;
    sourceImageUrl?: string | null;
    status: "draft" | "pending" | "approved" | "published";
    createdAt: string;
    wordCount: number;
}

const statusConfig: Record<Draft["status"], { label: string; className: string }> = {
    draft: { label: "Draft", className: "status-draft" },
    pending: { label: "Pending Approval", className: "status-pending" },
    approved: { label: "Approved", className: "status-approved" },
    published: { label: "Published", className: "status-published" },
};

const variationLabel: Record<string, string> = {
    brutal: "Brutal",
    x_factor: "X-Factor",
    deep_dive: "Deep Dive",
};

export function DraftCard({ draft }: { draft: Draft }) {
    const [status, setStatus] = useState(draft.status);
    const [aiOutput, setAiOutput] = useState(draft.aiOutput);
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(draft.aiOutput);
    const [copied, setCopied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isPending, startTransition] = useTransition();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showMenu) return;
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showMenu]);

    const currentStatus = statusConfig[status];
    const hasRealAudio = draft.sourceAudioUrl && !draft.sourceAudioUrl.startsWith("mock://") && !draft.sourceAudioUrl.startsWith("text://");
    const hasImage = !!draft.sourceImageUrl;

    function handleCopy(e: React.MouseEvent) {
        e.preventDefault();
        navigator.clipboard.writeText(aiOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function handleEditStart(e: React.MouseEvent) {
        e.preventDefault();
        setEditValue(aiOutput);
        setEditing(true);
    }

    function handleEditCancel(e: React.MouseEvent) {
        e.preventDefault();
        setEditing(false);
    }

    function handleSave(e: React.MouseEvent) {
        e.preventDefault();
        startTransition(async () => {
            await saveDraftEdit(draft.id, editValue);
            setAiOutput(editValue);
            setEditing(false);
        });
    }

    function handlePublish(e: React.MouseEvent) {
        e.preventDefault();
        if (status === "published") return;
        startTransition(async () => {
            await publishDraft(draft.id);
            setStatus("published");
        });
    }

    async function handleRegenerate(e: React.MouseEvent, instruction: string) {
        e.preventDefault();
        setShowMenu(false);
        setIsRegenerating(true);
        try {
            const res = await fetch("/api/drafts/regenerate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ draftId: draft.id, instruction }),
            });
            const data = await res.json();
            if (res.ok && data.aiOutput) {
                setAiOutput(data.aiOutput);
                setEditValue(data.aiOutput);
            }
        } finally {
            setIsRegenerating(false);
        }
    }

    const cardContent = (
        <Card className="glass-card rounded-2xl p-0 overflow-hidden border-white/[0.06] hover:border-[#6366f1]/30 hover:shadow-[0_8px_32px_-4px_rgba(99,102,241,0.12)] transition-all duration-300 group cursor-pointer relative">
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${currentStatus.className}`}>
                        {currentStatus.label}
                    </span>
                    {draft.variationType && variationLabel[draft.variationType] && (
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-[#E855A0]/10 text-[#E855A0] uppercase tracking-wider border border-[#E855A0]/20">
                            {variationLabel[draft.variationType]}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {draft.createdAt}
                    </span>
                    <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {draft.wordCount}w
                    </span>
                </div>
            </div>

            {/* Content */}
            {editing ? (
                <div className="p-4 lg:p-5">
                    <p className="text-[10px] uppercase tracking-widest text-[#818cf8]/70 mb-2 font-medium">
                        Editing AI Output
                    </p>
                    <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/90 leading-relaxed resize-none focus:outline-none focus:border-[#6366f1]/50"
                        autoFocus
                        onClick={(e) => e.preventDefault()}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                    <div className="p-4 lg:p-5">
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-medium">
                            Raw Input
                        </p>
                        {hasImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={draft.sourceImageUrl!}
                                alt="Source image"
                                className="w-full h-20 object-cover rounded-lg mb-2 opacity-80"
                            />
                        )}
                        <p className="text-xs text-white/50 leading-relaxed line-clamp-4">
                            {draft.rawTranscript || (hasImage ? "(image — no caption)" : "")}
                        </p>
                    </div>
                    <div className="p-4 lg:p-5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#818cf8]/[0.02] to-transparent pointer-events-none" />
                        <p className="text-[10px] uppercase tracking-widest text-[#818cf8]/70 mb-2 font-medium">
                            AI Output
                        </p>
                        <p className="text-xs text-white/80 leading-relaxed line-clamp-4 whitespace-pre-line relative z-10">
                            {aiOutput}
                        </p>
                    </div>
                </div>
            )}

            {/* Action bar */}
            <div className="flex flex-wrap items-center justify-between px-4 lg:px-5 py-3 border-t border-white/5 bg-white/[0.01] gap-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    {editing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#22c55e]/10 text-[#4ade80] hover:bg-[#22c55e]/20 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-3 h-3" />
                                {isPending ? "Saving…" : "Save"}
                            </button>
                            <button
                                onClick={handleEditCancel}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3 h-3" /> Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handlePublish}
                                disabled={isPending || status === "published"}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                style={{
                                    background: status === "published" ? "rgba(34,197,94,0.1)" : "rgba(99,102,241,0.15)",
                                    color: status === "published" ? "#4ade80" : "#818cf8",
                                }}
                            >
                                {status === "published" ? (
                                    <><Check className="w-3 h-3" /> Published</>
                                ) : isPending ? "Publishing…" : (
                                    <><Send className="w-3 h-3" /> Publish</>
                                )}
                            </button>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
                            >
                                {copied
                                    ? <><Check className="w-3 h-3 text-[#4ade80]" /><span className="text-[#4ade80]">Copied</span></>
                                    : <><Copy className="w-3 h-3" /> Copy</>
                                }
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); setShowPreview(true); }}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
                            >
                                <Eye className="w-3 h-3" /> Preview
                            </button>
                            <button
                                onClick={handleEditStart}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
                            >
                                <Pencil className="w-3 h-3" /> Edit
                            </button>
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={(e) => { e.preventDefault(); setShowMenu((v) => !v); }}
                                    disabled={isRegenerating}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
                                    {isRegenerating ? "Regenerating…" : "Regenerate"}
                                </button>
                                {showMenu && (
                                    <div className="absolute bottom-full mb-1.5 left-0 w-52 bg-[#1a1a1f] border border-white/10 rounded-xl overflow-hidden shadow-xl z-20">
                                        {[
                                            { label: "Brutal Edit", instruction: "Cut this by 40%. Remove every redundant word, qualifier, and throat-clearing sentence. Keep only the sharpest, most impactful lines. No filler. No softening." },
                                            { label: "X-Factor Thread", instruction: "Rewrite as a 5–7 part Twitter/X thread. Tweet 1 is a standalone hook that stops the scroll. Tweets 2–6 each deliver one concrete insight. Final tweet is a strong declaration or CTA. Each tweet under 280 characters, numbered." },
                                            { label: "Deep Dive", instruction: "Expand this into a detailed long-form LinkedIn post. Add step-by-step how-to specifics, concrete examples from the transcript, and a actionable takeaway for each main point. This should read like a mini lesson, not a brag." },
                                        ].map(({ label, instruction }) => (
                                            <button
                                                key={label}
                                                onClick={(e) => handleRegenerate(e, instruction)}
                                                className="w-full text-left px-4 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {hasRealAudio && (
                                <a
                                    href={draft.sourceAudioUrl!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
                                >
                                    <Volume2 className="w-3 h-3" /> Audio
                                </a>
                            )}
                            {hasImage && (
                                <a
                                    href={draft.sourceImageUrl!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
                                >
                                    <ImageIcon className="w-3 h-3" /> Image
                                </a>
                            )}
                        </>
                    )}
                </div>

                {!editing && (
                    <span className="text-xs text-[#818cf8]/70 flex items-center gap-1 font-medium group-hover:text-[#818cf8] transition-colors">
                        Editor <ArrowUpRight className="w-3 h-3" />
                    </span>
                )}
            </div>
        </Card>
    );

    const withPreview = (
        <>
            {cardContent}
            {showPreview && (
                <SocialPreview text={aiOutput} onClose={() => setShowPreview(false)} />
            )}
        </>
    );

    if (editing || showMenu || isRegenerating || showPreview) return <div>{withPreview}</div>;
    return <Link href={`/dashboard/editor/${draft.id}`}>{withPreview}</Link>;
}
