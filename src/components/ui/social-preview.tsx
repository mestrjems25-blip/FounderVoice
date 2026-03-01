"use client";

import { useState } from "react";
import { Linkedin, Twitter, X } from "lucide-react";

function parseThread(text: string): string[] {
    const lines = text.split("\n");
    const tweets: string[] = [];
    let current = "";

    for (const line of lines) {
        if (/^\d+[/.]\s/.test(line.trim())) {
            if (current.trim()) tweets.push(current.trim());
            current = line;
        } else {
            current += (current ? "\n" : "") + line;
        }
    }
    if (current.trim()) tweets.push(current.trim());
    return tweets.length > 1 ? tweets : [text];
}

interface SocialPreviewProps {
    text: string;
    onClose: () => void;
    mode?: "linkedin" | "twitter";
    inline?: boolean;
}

const LINKEDIN_TRUNCATE = 140;

function PreviewBody({ text, mode }: { text: string; mode: "linkedin" | "twitter" }) {
    const [expanded, setExpanded] = useState(false);

    const tweets = parseThread(text);
    const isThread = tweets.length > 1;

    if (mode === "linkedin") {
        const isTruncated = text.length > LINKEDIN_TRUNCATE;
        const hookVisible = isTruncated && !expanded;

        return (
            <div className="flex flex-col gap-3">
                {/* LinkedIn card */}
                <div className="max-w-[552px] w-full bg-white border border-gray-200 rounded-lg shadow-sm font-sans text-[14px]">
                    {/* Header */}
                    <div className="flex p-3 items-start gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center text-white text-base font-bold shrink-0">
                            F
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-black text-[14px] leading-tight">Founder Name</span>
                            <span className="text-gray-500 text-[12px] leading-tight mt-0.5">CEO & Co-Founder</span>
                            <span className="text-gray-400 text-[12px] leading-tight mt-0.5">1h · 🌐</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-3 pb-3 text-[#191919] leading-[1.42857]">
                        <p className="whitespace-pre-wrap">
                            {expanded || !isTruncated
                                ? text
                                : `${text.slice(0, LINKEDIN_TRUNCATE)}… `}
                            {isTruncated && !expanded && (
                                <button
                                    onClick={() => setExpanded(true)}
                                    className="text-gray-500 font-semibold cursor-pointer hover:text-gray-700"
                                >
                                    see more
                                </button>
                            )}
                        </p>
                    </div>

                    {/* Interaction bar */}
                    <div className="border-t border-gray-100 px-1 py-0.5 flex justify-between text-gray-500 text-[13px] font-semibold">
                        <div className="flex">
                            {[
                                { emoji: "👍", label: "Like" },
                                { emoji: "💬", label: "Comment" },
                                { emoji: "🔁", label: "Repost" },
                                { emoji: "↗️", label: "Send" },
                            ].map(({ emoji, label }) => (
                                <span
                                    key={label}
                                    className="flex items-center gap-1 py-2 px-2 hover:bg-gray-100 rounded cursor-pointer select-none"
                                >
                                    {emoji} {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fold annotation */}
                <p className="text-[10px] flex items-center gap-1.5" style={{ color: hookVisible ? "#f59e0b" : "#22c55e" }}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${hookVisible ? "bg-amber-400" : "bg-green-400"}`} />
                    {hookVisible
                        ? `Hook visible (${LINKEDIN_TRUNCATE} chars shown) — reader must click to see the rest`
                        : "Full post above the fold"}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {(isThread ? tweets : [text]).map((tweet, i) => {
                const count = tweet.length;
                const overLimit = count > 280;
                const nearLimit = count > 240;
                return (
                    <div key={i} className="bg-[#16181c] border border-white/[0.06] rounded-xl p-4">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                F
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-bold text-white">Founder</span>
                                <span className="text-xs text-white/40">@handle</span>
                            </div>
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">{tweet}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                            <span className="text-[10px] text-white/25">
                                {isThread ? `Tweet ${i + 1} of ${tweets.length}` : "Single post"}
                            </span>
                            <span className={`text-xs tabular-nums font-medium ${overLimit ? "text-red-400" : nearLimit ? "text-amber-400" : "text-white/30"}`}>
                                {count} / 280
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function SocialPreview({ text, onClose, mode: initialMode, inline = false }: SocialPreviewProps) {
    const [mode, setMode] = useState<"linkedin" | "twitter">(initialMode ?? "linkedin");

    if (inline) {
        return <PreviewBody text={text} mode={mode} />;
    }

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-[#0f0f10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setMode("linkedin")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === "linkedin" ? "bg-[#0077b5]/15 text-[#38bdf8] border border-[#0077b5]/25" : "text-white/40 hover:text-white/60"}`}
                        >
                            <Linkedin className="w-3.5 h-3.5" />
                            LinkedIn
                        </button>
                        <button
                            onClick={() => setMode("twitter")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === "twitter" ? "bg-white/8 text-white border border-white/15" : "text-white/40 hover:text-white/60"}`}
                        >
                            <Twitter className="w-3.5 h-3.5" />
                            X / Twitter
                        </button>
                    </div>
                    <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-5 overflow-y-auto max-h-[72vh]">
                    <PreviewBody text={text} mode={mode} />
                </div>
            </div>
        </div>
    );
}
