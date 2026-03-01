import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Terms and Conditions | FounderVoice AI",
    description: "Terms and Conditions for using the FounderVoice AI platform.",
};

export default function TermsPage() {
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
                            Terms & Conditions
                        </h1>
                        <p className="text-gray-500">Last updated: February 28, 2026</p>
                    </div>

                    <div className="prose max-w-none text-black prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-black prose-p:text-black prose-li:text-black prose-a:text-[#E855A0] prose-a:no-underline hover:prose-a:underline">
                        <p>
                            Welcome to FounderVoice AI. By accessing this website, we assume you accept these terms and conditions. Do not continue to use FounderVoice AI if you do not agree to take all of the terms and conditions stated on this page.
                        </p>

                        <h2>1. License</h2>
                        <p>
                            Unless otherwise stated, FounderVoice AI and/or its licensors own the intellectual property rights for all material on FounderVoice AI. All intellectual property rights are reserved. You may access this from FounderVoice AI for your own personal use subjected to restrictions set in these terms and conditions.
                        </p>
                        <p>You must not:</p>
                        <ul>
                            <li>Republish material from FounderVoice AI</li>
                            <li>Sell, rent or sub-license material from FounderVoice AI</li>
                            <li>Reproduce, duplicate or copy material from FounderVoice AI</li>
                            <li>Redistribute content from FounderVoice AI</li>
                        </ul>

                        <h2>2. User Content and Audio Data</h2>
                        <p>
                            Parts of this website offer an opportunity for users to submit voice memos, audio recordings, and generate text ("Content"). FounderVoice AI does not claim ownership of the final generated posts you export and publish to LinkedIn or other platforms. The intellectual property of the final generated posts belongs to you.
                        </p>
                        <p>
                            By uploading voice memos, you grant FounderVoice AI a license to process, transcribe, and analyze the audio solely for the purpose of operating the Service, providing you the generated text, and fine-tuning your individual voice profile.
                        </p>

                        <h2>3. Acceptable Use</h2>
                        <p>
                            You agree not to use the Service to generate content that is illegal, defamatory, threatening, infringing of intellectual property rights, invasive of privacy, or otherwise injurious to third parties. FounderVoice AI reserves the right to terminate your account if you are found to be using the Service for malicious purposes.
                        </p>

                        <h2>4. Disclaimer of Warranties</h2>
                        <p>
                            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. FounderVoice AI makes no representations or warranties of any kind, express or implied, as to the operation of their services, or the information, content, or materials included therein. You expressly agree that your use of the Service is at your sole risk.
                        </p>

                        <h2>5. Limitation of Liability</h2>
                        <p>
                            In no event shall FounderVoice AI, nor any of its officers, directors and employees, be liable to you for anything arising out of or in any way connected with your use of this Website, whether such liability is under contract, tort or otherwise.
                        </p>

                        <h2>6. Subscription and Billing</h2>
                        <p>
                            If you purchase a subscription to FounderVoice AI, you agree to pay the fees applicable to your selected plan. Subscriptions renew automatically unless canceled prior to the end of the current billing cycle. We reserve the right to change our prices at any time upon notice.
                        </p>

                        <h2>7. Governing Law</h2>
                        <p>
                            These Terms will be governed by and interpreted in accordance with the laws of the State, and you submit to the non-exclusive jurisdiction of the state and federal courts located in the State for the resolution of any disputes.
                        </p>

                        <h2>8. Contact Information</h2>
                        <p>
                            If you have any queries regarding any of our terms, please contact us at:
                        </p>
                        <p>
                            <a href="mailto:legal@foundervoice.ai">legal@foundervoice.ai</a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
