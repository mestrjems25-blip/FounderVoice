import { SignInForm } from "./sign-in-form";

interface PageProps {
    searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function SignInPage({ searchParams }: PageProps) {
    const { error, message } = await searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#080808]">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <span className="text-2xl font-bold tracking-tight" style={{ color: "#E855A0" }}>
                        FounderVoice
                    </span>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
                        Welcome back
                    </h1>
                    <p className="mt-1.5 text-sm text-white/40">
                        Sign in to your account
                    </p>
                </div>

                <div className="glass-card rounded-2xl p-7">
                    <SignInForm error={error} message={message} />
                </div>
            </div>
        </div>
    );
}
