import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export const metadata = {
    title: "Blog & Changelog | FounderVoice AI",
    description: "Read the latest updates and articles from FounderVoice AI.",
};

export default function BlogAndChangelogPage() {
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

            <main className="pt-32 pb-24 flex items-center justify-center min-h-[70vh]">
                <div className="text-center px-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                        <Clock className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                        Coming Soon
                    </h1>
                    <p className="text-gray-500 text-lg max-w-md mx-auto">
                        We are working hard on preparing our first set of articles and product update logs. Check back soon!
                    </p>
                    <div className="mt-8">
                        <Link href="/" className="inline-flex items-center justify-center bg-[#E855A0] text-white font-semibold rounded-full px-8 py-3 transition-transform hover:scale-105">
                            Return Home
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
