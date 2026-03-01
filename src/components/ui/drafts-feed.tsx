"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mic, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DraftGroup, type DraftGroupData } from "@/components/ui/draft-group";
import { type Draft } from "@/components/ui/draft-card";
import { supabase } from "@/lib/supabase/client";

export interface DbDraft {
    id: string;
    user_id: string;
    raw_transcript: string;
    ai_output: string;
    variation_type: string | null;
    source_audio_url: string | null;
    source_image_url: string | null;
    status: "draft" | "pending" | "approved" | "published" | "scheduled";
    created_at: string;
    updated_at: string;
}

function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function toCard(row: DbDraft): Draft {
    return {
        id: row.id,
        rawTranscript: row.raw_transcript,
        aiOutput: row.ai_output,
        variationType: row.variation_type,
        sourceAudioUrl: row.source_audio_url,
        sourceImageUrl: row.source_image_url,
        status: row.status,
        createdAt: relativeTime(row.created_at),
        wordCount: row.ai_output?.split(/\s+/).filter(Boolean).length ?? 0,
    };
}

function groupDrafts(drafts: Draft[]): DraftGroupData[] {
    const map = new Map<string, DraftGroupData>();
    for (const d of drafts) {
        const key = d.rawTranscript;
        if (!map.has(key)) {
            const sourceType: DraftGroupData["sourceType"] = d.sourceAudioUrl
                ? "voice"
                : d.sourceImageUrl
                ? "image"
                : "text";
            map.set(key, {
                key,
                transcript: d.rawTranscript,
                createdAt: d.createdAt,
                sourceType,
                drafts: [],
            });
        }
        const group = map.get(key)!;
        // Drafts arrive newest-first; keep only the first (latest) of each variationType
        if (!group.drafts.some((x) => x.variationType === d.variationType)) {
            group.drafts.push(d);
        }
    }
    return Array.from(map.values());
}

interface DraftsFeedProps {
    initialDrafts: DbDraft[];
    userId: string;
}

export function DraftsFeed({ initialDrafts, userId }: DraftsFeedProps) {
    const [drafts, setDrafts] = useState<Draft[]>(initialDrafts.map(toCard));
    const [search, setSearch] = useState("");

    useEffect(() => {
        const channel = supabase
            .channel("drafts-live")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "drafts",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    setDrafts((prev) => [toCard(payload.new as DbDraft), ...prev]);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    const filtered = search.trim()
        ? drafts.filter(
            (d) =>
                d.rawTranscript.toLowerCase().includes(search.toLowerCase()) ||
                d.aiOutput.toLowerCase().includes(search.toLowerCase())
        )
        : drafts;

    const groups = groupDrafts(filtered);

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Your Drafts</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review, edit, and publish your AI-generated LinkedIn content.
                    </p>
                </div>
                <a
                    href="https://wa.me/14155238886"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0 transition-opacity hover:opacity-90"
                    style={{ background: "#25D366" }}
                >
                    <MessageCircle className="w-4 h-4" />
                    Create Draft via WhatsApp
                </a>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search drafts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#6366f1]"
                    />
                </div>
            </motion.div>

            {groups.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-[40vh] gap-4 text-center"
                >
                    <div className="w-14 h-14 rounded-2xl bg-[#E855A0]/10 flex items-center justify-center">
                        <Mic className="w-6 h-6 text-[#E855A0]" />
                    </div>
                    <div>
                        <p className="text-gray-800 font-semibold text-base">
                            {search ? "No drafts match your search." : "No drafts yet."}
                        </p>
                        {!search && (
                            <p className="text-gray-500 text-sm mt-1">
                                Send a voice note to <span className="font-medium text-gray-700">+1 415 523 8886</span> on WhatsApp to generate your first drafts.
                            </p>
                        )}
                    </div>
                </motion.div>
            ) : (
                <div className="flex flex-col gap-4">
                    <AnimatePresence initial={false}>
                        {groups.map((group, i) => (
                            <motion.div
                                key={group.key}
                                layout
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ delay: i < 6 ? i * 0.05 : 0, duration: 0.3 }}
                            >
                                <DraftGroup
                                    group={group}
                                    onDelete={() => {
                                        const ids = new Set(group.drafts.map((d) => d.id));
                                        setDrafts((prev) => prev.filter((d) => !ids.has(d.id)));
                                    }}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
