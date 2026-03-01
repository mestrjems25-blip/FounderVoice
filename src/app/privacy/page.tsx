import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Privacy Policy | FounderVoice AI",
    description: "Privacy Policy for FounderVoice AI. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Simple Header */}
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

            {/* Content */}
            <main className="pt-32 pb-24">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-gray-500">Last updated: February 28, 2026</p>
                    </div>

                    <div className="prose max-w-none text-black prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-black prose-p:text-black prose-li:text-black prose-a:text-[#E855A0] prose-a:no-underline hover:prose-a:underline">
                        <p>
                            At FounderVoice AI ("we", "our", or "us"), we are committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by FounderVoice AI.
                        </p>

                        <p>
                            This Privacy Policy applies to our website, and its associated subdomains (collectively, our "Service") alongside our application, FounderVoice AI. By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy and our Terms of Service.
                        </p>

                        <h2>1. Information We Collect</h2>
                        <p>
                            We collect information from you when you visit our service, register, place an order, subscribe to our newsletter, respond to a survey or fill out a form.
                        </p>
                        <ul>
                            <li><strong>Personal Data:</strong> Name / Username, Email Addresses, Phone Numbers, and Billing Addresses.</li>
                            <li><strong>Audio Data:</strong> Voice memos and audio recordings you submit to generate content.</li>
                            <li><strong>Content Data:</strong> The generated text, drafts, and finalized LinkedIn posts created through our Service.</li>
                        </ul>

                        <h2>2. How We Use Your Information</h2>
                        <p>
                            Any of the information we collect from you may be used in one of the following ways:
                        </p>
                        <ul>
                            <li><strong>To personalize your experience:</strong> (your information helps us to better respond to your individual needs, including matching your specific tone of voice).</li>
                            <li><strong>To improve our service:</strong> (we continually strive to improve our service offerings based on the information and feedback we receive from you).</li>
                            <li><strong>To process transactions:</strong> (your information, whether public or private, will not be sold, exchanged, transferred, or given to any other company for any reason whatsoever, without your consent, other than for the express purpose of delivering the purchased product or service requested).</li>
                            <li><strong>To train our AI models:</strong> Your voice memos and edits are used specifically to fine-tune your dedicated voice profile. We do <strong>not</strong> use your private audio data to train foundational models across other user accounts.</li>
                        </ul>

                        <h2>3. Security of Your Information</h2>
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. We offer the use of a secure server. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our Payment gateway providers database only to be accessible by those authorized with special access rights to such systems, and are required to keep the information confidential.
                        </p>

                        <h2>4. Third-Party Services</h2>
                        <p>
                            We may share your information with third-party service providers (such as OpenAI or Anthropic for processing text generation, and Stripe for payment processing) strictly for the purpose of providing our services to you. These third parties are bound by strict confidentiality agreements and data processing addendums.
                        </p>

                        <h2>5. Your Consent</h2>
                        <p>
                            By using our site, you consent to our online Privacy Policy.
                        </p>

                        <h2>6. Changes To Our Privacy Policy</h2>
                        <p>
                            If we decide to change our privacy policy, we will post those changes on this page, and/or update the Privacy Policy modification date above.
                        </p>

                        <h2>7. Contact Us</h2>
                        <p>
                            If there are any questions regarding this privacy policy, you may contact us using the information below.
                        </p>
                        <p>
                            <a href="mailto:privacy@foundervoice.ai">privacy@foundervoice.ai</a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
