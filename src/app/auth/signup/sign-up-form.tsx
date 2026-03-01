"use client";

import { useTransition } from "react";
import Link from "next/link";
import { signUp } from "@/app/auth/actions";

interface Props {
    error?: string;
}

export function SignUpForm({ error }: Props) {
    const [isPending, startTransition] = useTransition();

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            await signUp(formData);
        });
    }

    return (
        <form action={handleSubmit} className="flex flex-col gap-4">
            {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
                    Full Name
                </label>
                <input
                    type="text"
                    name="full_name"
                    required
                    autoComplete="name"
                    placeholder="Alex Johnson"
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[#6366f1]/60 transition-colors"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[#6366f1]/60 transition-colors"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[#6366f1]/60 transition-colors"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="glow-button mt-2 w-full h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] disabled:opacity-60 transition-opacity"
            >
                {isPending ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-white/40 mt-1">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-[#818cf8] hover:text-white transition-colors font-medium">
                    Sign in
                </Link>
            </p>
        </form>
    );
}
