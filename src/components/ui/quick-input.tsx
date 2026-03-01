"use client";

import { useState, useRef, useEffect } from "react";
import {
    Mic, StopCircle, Upload, Type, ImageIcon,
    Loader2, CheckCircle2, AlertCircle, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "text" | "voice" | "image";
type Status = "idle" | "processing" | "success" | "error";

const MODES: { id: Mode; label: string; icon: React.ElementType }[] = [
    { id: "text", label: "Text", icon: Type },
    { id: "voice", label: "Voice", icon: Mic },
    { id: "image", label: "Image", icon: ImageIcon },
];

const PROCESSING_MESSAGES = [
    "Analyzing your input...",
    "Applying Voice DNA...",
    "Consulting Context Vault...",
    "Generating 3 variations...",
    "Polishing your drafts...",
];

export function QuickInput() {
    const [mode, setMode] = useState<Mode>("text");
    const [status, setStatus] = useState<Status>("idle");
    const [isRecording, setIsRecording] = useState(false);
    const [text, setText] = useState("");
    const [caption, setCaption] = useState("");
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioMime, setAudioMime] = useState("audio/webm");
    const [recordingTime, setRecordingTime] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [dragover, setDragover] = useState(false);
    const [msgIndex, setMsgIndex] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const msgTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (status === "processing") {
            setMsgIndex(0);
            msgTimerRef.current = setInterval(() => {
                setMsgIndex((i) => (i + 1) % PROCESSING_MESSAGES.length);
            }, 2500);
        }
        return () => {
            if (msgTimerRef.current) clearInterval(msgTimerRef.current);
        };
    }, [status]);

    useEffect(() => {
        if (status === "success") {
            const t = setTimeout(() => {
                setStatus("idle");
                setText("");
                setCaption("");
                setAudioBlob(null);
                setRecordingTime(0);
                setImageFile(null);
                setImagePreview(null);
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [status]);

    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
        }
    }, [text]);

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
            setAudioMime(mimeType);
            const recorder = new MediaRecorder(stream, { mimeType });
            chunksRef.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                setAudioBlob(new Blob(chunksRef.current, { type: mimeType }));
                stream.getTracks().forEach((t) => t.stop());
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
        } catch {
            setErrorMsg("Microphone access denied");
            setStatus("error");
        }
    }

    function stopRecording() {
        mediaRecorderRef.current?.stop();
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
    }

    function handleImageFile(file: File | null | undefined) {
        if (!file || !file.type.startsWith("image/")) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    function clearImage() {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(null);
        setImagePreview(null);
    }

    function fmt(s: number) {
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    }

    async function handleGenerate() {
        setStatus("processing");
        setErrorMsg("");
        try {
            const fd = new FormData();
            if (mode === "text") {
                fd.set("type", "text");
                fd.set("content", text);
            } else if (mode === "voice") {
                if (!audioBlob) throw new Error("No recording");
                const ext = audioMime.includes("ogg") ? "ogg" : audioMime.includes("mp4") ? "mp4" : "webm";
                fd.set("type", "audio");
                fd.set("file", new File([audioBlob], `recording.${ext}`, { type: audioMime }));
            } else {
                if (!imageFile) throw new Error("No image");
                fd.set("type", "image");
                fd.set("file", imageFile);
                fd.set("caption", caption);
            }

            const res = await fetch("/api/process-web", { method: "POST", body: fd });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error ?? "Request failed");
            setStatus("success");
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
            setStatus("error");
        }
    }

    const canGenerate =
        status === "idle" &&
        !isRecording &&
        ((mode === "text" && text.trim().length > 0) ||
            (mode === "voice" && audioBlob !== null) ||
            (mode === "image" && imageFile !== null));

    if (status !== "idle") {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white mb-8 flex flex-col items-center justify-center gap-3 min-h-[140px] p-8">
                {status === "processing" && (
                    <>
                        <Loader2 className="w-6 h-6 text-[#6366f1] animate-spin" />
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={msgIndex}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.25 }}
                                className="text-sm text-gray-500 font-medium"
                            >
                                {PROCESSING_MESSAGES[msgIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </>
                )}
                {status === "success" && (
                    <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <p className="text-sm text-gray-600 font-medium">
                            Your 3 drafts are ready — check the feed below.
                        </p>
                    </>
                )}
                {status === "error" && (
                    <>
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        <p className="text-sm text-red-500 font-medium">{errorMsg || "Something went wrong."}</p>
                        <button
                            onClick={() => setStatus("idle")}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1"
                        >
                            Try again
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white mb-8 overflow-hidden">
            {/* Mode tabs */}
            <div className="flex border-b border-gray-200">
                {MODES.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setMode(id)}
                        className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold tracking-wide transition-colors ${
                            mode === id
                                ? "text-[#6366f1] border-b-2 border-[#6366f1] -mb-px bg-indigo-50"
                                : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Input area */}
            <div className="p-5">
                {mode === "text" && (
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Dump your thoughts — a win, a lesson, a hot take, a story from this week..."
                        rows={3}
                        className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 resize-none outline-none leading-relaxed"
                        style={{ minHeight: "80px", maxHeight: "260px" }}
                    />
                )}

                {mode === "voice" && (
                    <div className="flex flex-col items-center gap-4 py-5">
                        {!isRecording && !audioBlob && (
                            <>
                                <button
                                    onClick={startRecording}
                                    className="w-14 h-14 rounded-full bg-[#E855A0] flex items-center justify-center hover:bg-[#d44090] transition-colors shadow-sm"
                                >
                                    <Mic className="w-6 h-6 text-white" />
                                </button>
                                <p className="text-xs text-gray-400">Tap to start recording</p>
                            </>
                        )}

                        {isRecording && (
                            <>
                                <button
                                    onClick={stopRecording}
                                    className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                                >
                                    <StopCircle className="w-6 h-6 text-white" />
                                </button>
                                <span className="text-xs font-mono text-gray-500 animate-pulse">
                                    {fmt(recordingTime)} — recording
                                </span>
                            </>
                        )}

                        {!isRecording && audioBlob && (
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg px-3 py-1.5">
                                    <Mic className="w-3.5 h-3.5 text-[#6366f1]" />
                                    Recording ready ({fmt(recordingTime)})
                                </div>
                                <button
                                    onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Discard recording"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {mode === "image" && (
                    <div className="flex flex-col gap-3">
                        {!imageFile ? (
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                                onDragLeave={() => setDragover(false)}
                                onDrop={(e) => { e.preventDefault(); setDragover(false); handleImageFile(e.dataTransfer.files[0]); }}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
                                    dragover
                                        ? "border-[#6366f1] bg-indigo-50"
                                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                }`}
                            >
                                <Upload className="w-5 h-5 text-gray-400" />
                                <p className="text-xs text-gray-400">Drop an image here, or click to upload</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageFile(e.target.files?.[0])}
                                />
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <div className="relative flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imagePreview!}
                                        alt="Selected"
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        onClick={clearImage}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-900 transition-colors"
                                        aria-label="Remove image"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Add context or a caption (optional)..."
                                    rows={3}
                                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 resize-none outline-none leading-relaxed"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex justify-end">
                <Button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="glow-button text-white border-0 rounded-xl h-9 px-5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "#6366f1" }}
                >
                    Generate Drafts
                </Button>
            </div>
        </div>
    );
}
