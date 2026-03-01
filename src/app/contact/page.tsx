import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata = {
    title: "Contact Us | FounderVoice AI",
    description: "Get in touch with the FounderVoice AI team.",
};

export default function ContactPage() {
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
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6" style={{ color: "#E855A0" }}>
                        <Mail className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                        Get in touch
                    </h1>
                    <p className="text-gray-500 text-lg mb-12">
                        Have questions about pricing, features, or setting up your voice profile? We&apos;d love to chat.
                    </p>

                    <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                        <a
                            href="mailto:hello@foundervoice.ai"
                            className="text-2xl font-bold transition-colors hover:text-gray-600 block mb-2"
                            style={{ color: "#E855A0" }}
                        >
                            hello@foundervoice.ai
                        </a>
                        <p className="text-gray-500">
                            We typically reply within 24 hours.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
