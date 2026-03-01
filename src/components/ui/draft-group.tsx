"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, ImageIcon, Type, Clock, ExternalLink, Send, CheckCircle2, ChevronDown, ChevronUp, Trash2, Calendar, X } from "lucide-react";
import { publishDraft, deleteStack } from "@/app/dashboard/actions";
import type { Draft } from "@/components/ui/draft-card";

const VARIATION_ORDER = ["brutal", "x_factor", "deep_dive"];

const VARIATION_STYLE: Record<string, { label: string; bg: string; text: string }> = {
    brutal: { label: "Brutal", bg: "bg-indigo-50", text: "text-[#6366f1]" },
    x_factor: { label: "X-Factor", bg: "bg-pink-50", text: "text-[#E855A0]" },
    deep_dive: { label: "Deep Dive", bg: "bg-amber-50", text: "text-amber-600" },
};

const STATUS_DOT: Record<string, string> = {
    draft: "bg-gray-300",
    pending: "bg-amber-400",
    approved: "bg-green-500",
    published: "bg-blue-500",
    scheduled: "bg-indigo-400",
};

type SourceType = "voice" | "image" | "text";

export interface DraftGroupData {
    key: string;
    transcript: string;
    createdAt: string;
    sourceType: SourceType;
    drafts: Draft[];
}

function localDatetimeMin(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
}

function SourceBadge({ type }: { type: SourceType }) {
    const map: Record<SourceType, { Icon: React.ElementType; label: string; cls: string }> = {
        voice: { Icon: Mic, label: "Voice", cls: "text-[#E855A0] bg-pink-50 border-pink-100" },
        image: { Icon: ImageIcon, label: "Image", cls: "text-violet-600 bg-violet-50 border-violet-100" },
        text: { Icon: Type, label: "Text", cls: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    };
    const { Icon, label, cls } = map[type];
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}

function VariationCard({ draft }: { draft: Draft }) {
    const [status, setStatus] = useState<"draft" | "pending" | "approved" | "published" | "scheduled">(draft.status);
    const [isPending, startTransition] = useTransition();
    const [isScheduling, startScheduleTransition] = useTransition();
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduleDate, setScheduleDate] = useState("");
    const type = draft.variationType ?? "short";
    const style = VARIATION_STYLE[type] ?? VARIATION_STYLE.short;

    const done = (["published", "scheduled"] as string[]).includes(status);

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${style.bg} ${style.text}`}>
                    {style.label}
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] ?? "bg-gray-300"}`} />
                    <span className="text-[10px] text-gray-400 capitalize">{status}</span>
                </div>
            </div>

            <div className="px-4 py-3 flex-1">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-6 whitespace-pre-line">
                    {draft.aiOutput}
                </p>
                <p className="text-xs text-gray-400 mt-2">{draft.wordCount} words</p>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Link
                        href={`/dashboard/editor/${draft.id}`}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#6366f1] hover:underline"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Open in Editor
                    </Link>

                    {status === "published" ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            Published
                        </span>
                    ) : status === "scheduled" ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-indigo-500">
                            <Calendar className="w-3 h-3" />
                            Scheduled
                        </span>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setShowSchedule((v) => !v)}
                                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                            >
                                <Calendar className="w-3 h-3" />
                                Schedule
                            </button>
                            <button
                                onClick={() =>
                                    startTransition(async () => {
                                        await publishDraft(draft.id);
                                        setStatus("published");
                                    })
                                }
                                disabled={isPending || done}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E855A0] text-white hover:bg-[#d44590] transition-colors disabled:opacity-50"
                            >
                                <Send className="w-3 h-3" />
                                {isPending ? "…" : "Publish"}
                            </button>
                        </div>
                    )}
                </div>

                {showSchedule && !done && (
                    <div className="flex items-center gap-2">
                        <input
                            type="datetime-local"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={localDatetimeMin()}
                            className="flex-1 text-xs text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 bg-white"
                            style={{ colorScheme: "light" }}
                        />
                        <button
                            onClick={() => { setShowSchedule(false); setScheduleDate(""); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() =>
                                startScheduleTransition(async () => {
                                    if (!scheduleDate) return;
                                    await publishDraft(draft.id, new Date(scheduleDate).toISOString());
                                    setStatus("scheduled");
                                    setShowSchedule(false);
                                })
                            }
                            disabled={!scheduleDate || isScheduling}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
                        >
                            {isScheduling ? "…" : "Confirm"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function DeleteControls({
    confirmDelete,
    isDeleting,
    onConfirm,
    onCancel,
}: {
    confirmDelete: boolean;
    isDeleting: boolean;
    onConfirm: (e: React.MouseEvent) => void;
    onCancel: (e: React.MouseEvent) => void;
}) {
    if (confirmDelete) {
        return (
            <>
                <button
                    onClick={onCancel}
                    className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                    {isDeleting ? "…" : "Delete all"}
                </button>
            </>
        );
    }
    return null;
}

export function DraftGroup({ group, onDelete }: { group: DraftGroupData; onDelete: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();

    const sorted = [...group.drafts].sort(
        (a, b) =>
            VARIATION_ORDER.indexOf(a.variationType ?? "") -
            VARIATION_ORDER.indexOf(b.variationType ?? "")
    );

    const snippet =
        group.transcript.startsWith("mock://")
            ? group.transcript.replace("mock://", "")
            : group.transcript.length > 110
            ? group.transcript.slice(0, 110).trim() + "…"
            : group.transcript;

    const layerCount = Math.min(sorted.length, 3);
    const draftIds = group.drafts.map((d) => d.id);

    const handleDeleteConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        startDeleteTransition(async () => {
            await deleteStack(draftIds);
            onDelete();
        });
    };

    const handleDeleteCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDelete(false);
    };

    return (
        <div className="w-full">
            {/* ── Collapsed stack ── */}
            {!isExpanded && (
                <div
                    className="relative cursor-pointer select-none"
                    style={{ paddingBottom: layerCount >= 3 ? 10 : layerCount === 2 ? 5 : 0 }}
                    onClick={() => { if (!confirmDelete) setIsExpanded(true); }}
                >
                    {/* Ghost layers */}
                    {layerCount >= 3 && (
                        <div className="absolute inset-x-4 bottom-0 h-full rounded-2xl border border-gray-200 bg-gray-100" />
                    )}
                    {layerCount >= 2 && (
                        <div className="absolute inset-x-2 bottom-[5px] h-full rounded-2xl border border-gray-200 bg-gray-50" />
                    )}

                    {/* Front card */}
                    <div className="relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-[#6366f1]/40 hover:shadow-md transition-all duration-200 group">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                                    {snippet}
                                </p>
                                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                    <SourceBadge type={group.sourceType} />
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {group.createdAt}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 mt-0.5">
                                {confirmDelete ? (
                                    <DeleteControls
                                        confirmDelete={confirmDelete}
                                        isDeleting={isDeleting}
                                        onConfirm={handleDeleteConfirm}
                                        onCancel={handleDeleteCancel}
                                    />
                                ) : (
                                    <>
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                                            {sorted.length} variation{sorted.length !== 1 ? "s" : ""}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors shrink-0">
                                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#6366f1]" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Expanded state ── */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                    >
                        {/* Collapse header */}
                        <div
                            className="flex items-center gap-3 px-5 py-3.5 bg-white border border-gray-200 rounded-2xl mb-3 cursor-pointer hover:border-[#6366f1]/30 transition-colors group"
                            onClick={() => { setIsExpanded(false); setConfirmDelete(false); }}
                        >
                            <SourceBadge type={group.sourceType} />
                            <p className="text-sm text-gray-700 font-medium flex-1 min-w-0 truncate">
                                {snippet}
                            </p>
                            <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3" />
                                {group.createdAt}
                            </span>
                            {confirmDelete ? (
                                <DeleteControls
                                    confirmDelete={confirmDelete}
                                    isDeleting={isDeleting}
                                    onConfirm={handleDeleteConfirm}
                                    onCancel={handleDeleteCancel}
                                />
                            ) : (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                        <ChevronUp className="w-4 h-4 text-gray-500" />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* All 3 variation cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {sorted.map((draft) => (
                                <VariationCard key={draft.id} draft={draft} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
