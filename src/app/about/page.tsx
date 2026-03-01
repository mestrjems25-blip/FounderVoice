import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "About Us | FounderVoice AI",
    description: "Learn more about FounderVoice AI and our mission.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                    <div className="text-lg font-bold tracking-tight" style={{ color: "#E855A0" }}>
                        FounderVoice
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-24">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
                        About FounderVoice AI
                    </h1>
                    <p className="text-gray-600 text-lg leading-relaxed mb-12">
                        FounderVoice AI was built for busy founders who want to scale their personal brand on LinkedIn, without spending hours staring at a blank screen. We believe your authentic voice is your most valuable asset. Our AI doesn&apos;t write for you—it learns how you speak, and amplifies your ideas in seconds.
                    </p>
                    <div className="p-8 bg-[#100F11] rounded-2xl border border-gray-200">
                        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                        <p className="text-white/70">
                            To give every founder a dedicated, always-on content engine that captures the raw authenticity of a voice memo and polishes it into high-performing thought leadership.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
