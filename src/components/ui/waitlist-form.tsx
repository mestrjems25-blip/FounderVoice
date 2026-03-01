"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function WaitlistForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        // Simulate API call
        await new Promise((r) => setTimeout(r, 1500));
        setStatus("success");
        setEmail("");

        // Reset after 3s
        setTimeout(() => setStatus("idle"), 3000);
    };

    if (status === "success") {
        return (
            <div className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl py-4 px-6 text-green-400 text-sm font-medium">
                <Check className="w-4 h-4" />
                You&apos;re on the list! We&apos;ll be in touch soon.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="relative flex gap-2">
            <Input
                type="email"
                placeholder="founder@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50 rounded-xl px-5 text-sm focus:border-[#6366f1] focus:ring-[#6366f1]/20"
            />
            <Button
                type="submit"
                disabled={status === "loading"}
                className="glow-button h-12 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold px-6 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 border-0"
            >
                {status === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        Join Waitlist <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                )}
            </Button>
        </form>
    );
}
