"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Activity,
  Zap,
  Shield,
  Mic,
  PenTool,
  BarChart3,
  Send,
  Play,
  Type,
  Target,
  RefreshCw,
  Check,
  Star,
  MessageSquare,
  Users,
  TrendingUp,
  Globe,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { Typewriter } from "@/components/ui/typewriter";
import { LogoMarquee } from "@/components/ui/logo-marquee";
import { SectionBadge } from "@/components/ui/section-badge";
import { PricingCard } from "@/components/ui/pricing-card";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { TestimonialCard } from "@/components/ui/testimonial-card";

/* ─── Animation helpers ─── */
function FadeInView({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ─── */
const features = [
  {
    icon: Mic,
    title: "Voice-First Creation",
    description:
      "Record a quick voice memo on WhatsApp. Our AI captures your unique tone, cadence, and personality.",
    color: "icon-box-purple",
  },
  {
    icon: Zap,
    title: "Instant LinkedIn Posts",
    description:
      "Get polished, ready-to-publish LinkedIn content in seconds. Review, edit, and post — all from one dashboard.",
    color: "icon-box-green",
  },
  {
    icon: Shield,
    title: "Your Voice, Protected",
    description:
      "We learn YOUR style, not a generic template. Every post sounds authentically like you — because it is.",
    color: "icon-box-pink",
  },
];

const steps = [
  {
    num: "01",
    title: "Record your thoughts",
    description:
      "Open WhatsApp and send a voice memo about anything — a lesson learned, a hot take, a client win. Raw and unfiltered.",
  },
  {
    num: "02",
    title: "AI crafts your post",
    description:
      "Our Voice AI analyzes your tone, vocabulary, and style to write a LinkedIn post that sounds exactly like you.",
  },
  {
    num: "03",
    title: "Review and publish",
    description:
      "Edit in our side-by-side editor, tweak the tone if needed, then post directly to LinkedIn with one click.",
  },
];

const productFeatures = [
  {
    icon: Mic,
    title: "Voice Capture",
    description: "Record via WhatsApp, upload audio, or type your raw thoughts directly.",
    color: "icon-box-purple",
  },
  {
    icon: Layers,
    title: "AI Engine",
    description: "Trained on your unique voice profile to produce authentic, high-performing content.",
    color: "icon-box-pink",
  },
  {
    icon: PenTool,
    title: "Smart Editor",
    description: "Side-by-side raw input vs AI output. Change tone, re-generate, or fine-tune.",
    color: "icon-box-green",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track post performance, engagement rates, and voice consistency over time.",
    color: "icon-box-blue",
  },
];

const featureHighlights = [
  { icon: Type, title: "Tone matching", description: "Captures your natural speaking style" },
  { icon: Target, title: "Hook generation", description: "Creates scroll-stopping first lines" },
  { icon: RefreshCw, title: "Auto formatting", description: "LinkedIn-optimized structure" },
  { icon: TrendingUp, title: "Performance tips", description: "Suggestions to boost reach" },
];

const aiTabs = [
  {
    id: "tone",
    label: "Tone Match",
    title: "Your voice, not a template",
    description:
      "Our AI analyzes your vocabulary, sentence patterns, and personality markers from past voice memos to create content that's unmistakably you.",
    benefits: [
      "Learns from every voice memo you send",
      "Adapts to your evolving writing style",
      "Maintains consistency across all posts",
    ],
  },
  {
    id: "hooks",
    label: "Hook Gen",
    title: "Scroll-stopping first lines",
    description:
      "The first line decides if someone reads or scrolls. Our AI generates hooks that grab attention and keep readers engaged.",
    benefits: [
      "A/B tests different hook styles",
      "Learns what works for your audience",
      "Pattern-matches viral LinkedIn formats",
    ],
  },
  {
    id: "format",
    label: "Auto-Format",
    title: "LinkedIn-optimized structure",
    description:
      "Automatically formats your content with proper line breaks, spacing, and structure that the LinkedIn algorithm favors.",
    benefits: [
      "Optimized line lengths for readability",
      "Strategic emoji and hashtag placement",
      "Call-to-action suggestions included",
    ],
  },
  {
    id: "summary",
    label: "Summaries",
    title: "Long memos, short posts",
    description:
      "Rambled for 5 minutes? No problem. Our AI distills your key points into a concise, punchy LinkedIn post.",
    benefits: [
      "Extracts core message automatically",
      "Removes filler while keeping your voice",
      "Suggests multiple angles from one memo",
    ],
  },
];

const stats = [
  { icon: Zap, value: "50K+", label: "Posts generated", sub: "By founders worldwide", color: "icon-box-green" },
  { icon: Globe, value: "10x", label: "Faster content", sub: "Compared to writing from scratch", color: "icon-box-pink" },
  { icon: Star, value: "98%", label: "Voice accuracy", sub: "Posts that sound like you", color: "icon-box-purple" },
];

const roles = ["Founders", "Consultants", "Coaches", "Creators", "Agencies", "Freelancers"];

const pricingPlans = {
  monthly: [
    {
      name: "Free",
      price: 0,
      description: "Test the full pipeline",
      features: [
        "10 AI drafts / month",
        "3 post variations per input",
        "Omni-Input (WhatsApp + Web)",
        "Text, voice & image uploads",
        "Dashboard access",
      ],
    },
    {
      name: "Pro",
      price: 49,
      description: "For founders posting consistently",
      featured: true,
      features: [
        "100 AI drafts / month",
        "Visual Context (Image-to-Post)",
        "Context Vault (product & audience info)",
        "Voice DNA learning",
        "1-click LinkedIn & X publish",
        "Full Buffer scheduling",
        "Email support",
      ],
    },
    {
      name: "Founder",
      price: 149,
      description: "For high-volume thought leaders",
      features: [
        "Unlimited AI drafts",
        "Unlimited Vault entries",
        "Priority Vision processing",
        "Full Buffer scheduling",
        "Custom tone fine-tuning",
        "Dedicated Slack channel",
        "Team seats (3 users)",
        "White-glove onboarding",
      ],
    },
  ],
  yearly: [
    {
      name: "Free",
      price: 0,
      description: "Test the full pipeline",
      features: [
        "10 AI drafts / month",
        "3 post variations per input",
        "Omni-Input (WhatsApp + Web)",
        "Text, voice & image uploads",
        "Dashboard access",
      ],
    },
    {
      name: "Pro",
      price: 39,
      description: "For founders posting consistently",
      featured: true,
      features: [
        "100 AI drafts / month",
        "Visual Context (Image-to-Post)",
        "Context Vault (product & audience info)",
        "Voice DNA learning",
        "1-click LinkedIn & X publish",
        "Full Buffer scheduling",
        "Email support",
      ],
    },
    {
      name: "Founder",
      price: 119,
      description: "For high-volume thought leaders",
      features: [
        "Unlimited AI drafts",
        "Unlimited Vault entries",
        "Priority Vision processing",
        "Full Buffer scheduling",
        "Custom tone fine-tuning",
        "Dedicated Slack channel",
        "Team seats (3 users)",
        "White-glove onboarding",
      ],
    },
  ],
};

const testimonials = [
  {
    quote:
      "I used to spend 2 hours writing one LinkedIn post. Now I record a 60-second voice memo and get a post that sounds exactly like me.",
    name: "Sarah Chen",
    role: "Startup Founder, San Francisco",
    variant: "photo" as const,
  },
  {
    quote:
      "The voice matching is insane. My team couldn't tell which posts I wrote and which were AI-generated. That's the whole point.",
    name: "Marcus Williams",
    role: "Tech CEO, Austin",
    variant: "text" as const,
  },
  {
    quote:
      "I went from posting once a month to 4x per week. My inbound leads tripled. FounderVoice pays for itself 100x over.",
    name: "Elena Rodriguez",
    role: "Business Coach, Miami",
    variant: "photo" as const,
  },
  {
    quote:
      "As a consultant, LinkedIn is my #1 lead source. FounderVoice helped me stay consistent without burning out on content creation.",
    name: "David Park",
    role: "Management Consultant, NYC",
    variant: "text" as const,
  },
  {
    quote:
      "We manage 12 founder accounts. FounderVoice's multi-profile support means each client sounds uniquely themselves. Game changer for our agency.",
    name: "Jessica Taylor",
    role: "Agency Director, London",
    variant: "photo" as const,
  },
];

const faqItems = [
  {
    question: "How does the voice matching work?",
    answer:
      "When you send voice memos, our AI analyzes your vocabulary, sentence structure, tone, and personality markers. Over time, it builds a unique voice profile that ensures every post sounds authentically like you.",
  },
  {
    question: "Do I need a special app to record?",
    answer:
      "No — just use WhatsApp, which you probably already have. Send a voice memo to our FounderVoice number, and you'll get a polished LinkedIn post back within seconds.",
  },
  {
    question: "Can I edit the AI-generated posts?",
    answer:
      "Absolutely. Our side-by-side editor shows your raw voice input next to the AI output. You can tweak wording, change tone, re-generate with different angles, and more.",
  },
  {
    question: "Is my content and voice data secure?",
    answer:
      "Yes. We use enterprise-grade encryption for all voice data and generated content. Your voice profile is private and never shared. You retain full ownership of all content.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel anytime with no questions asked. Your data remains available for 30 days after cancellation, and you can export all your content at any time.",
  },
];

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [activeAiTab, setActiveAiTab] = useState("tone");
  const activeTabData = aiTabs.find((t) => t.id === activeAiTab) || aiTabs[0];

  return (
    <div className="overflow-hidden">
      <nav className="sticky-nav">
        <div className="flex items-center justify-between px-2 py-1">
          <Link href="/" className="flex items-center gap-2.5 pl-2">
            <span className="text-lg md:text-xl font-bold tracking-tight" style={{ color: "#E855A0" }}>
              FounderVoice
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </div>

          <div className="flex items-center gap-2 md:gap-3 pr-1 md:pr-2">
            <Link href="/dashboard" className="text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
              Login
            </Link>
            <Link
              href="#waitlist"
              className="inline-flex items-center justify-center text-white font-semibold transition-transform hover:scale-105 px-4 py-1.5 md:px-5 md:py-2 text-xs md:text-sm"
              style={{ background: "#E855A0", borderRadius: 999 }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero-gradient pt-24 pb-16 md:pt-32 md:pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-10 md:gap-16">
          <div className="flex flex-col items-center w-full">
            <FadeInView delay={0.1}>
              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold leading-[1.2] tracking-tight text-white max-w-4xl">
                Turn your voice into
                <span className="block mt-1 lg:mt-2">
                  <Typewriter />
                </span>
              </h1>
            </FadeInView>

            <FadeInView delay={0.2}>
              <p className="mt-6 text-sm md:text-base text-white/50 max-w-2xl mx-auto leading-relaxed">
                Send a 60-second voice memo on WhatsApp. Get a polished, high-performing
                LinkedIn post that sounds exactly like you — crafted by AI trained on your
                unique voice.
              </p>
            </FadeInView>

            <FadeInView delay={0.3}>
              <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4">
                <a
                  href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "14155238886").replace(/\D/g, "")}?text=Start`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#25D366] text-white font-semibold rounded-full px-8 py-3.5 transition-transform hover:scale-105 hover:bg-[#20bd5a]"
                >
                  <MessageSquare className="w-4 h-4" />
                  Connect on WhatsApp
                </a>
                <Link href="#how-it-works" className="btn-outline">
                  <Play className="w-4 h-4" />
                  Watch demo
                </Link>
              </div>
              <p className="mt-4 text-xs text-white/30 text-center">
                Free for 7 days · No password · Just WhatsApp
              </p>
            </FadeInView>
          </div>

          <FadeInView delay={0.4} className="relative hidden md:block w-full max-w-3xl">
            <div className="relative mx-auto">
              <div className="rounded-2xl bg-[#0e0e0e] border border-white/10 p-6 shadow-2xl shadow-black/50 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-3 text-xs text-white/30">FounderVoice Dashboard</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-white/80">Latest Draft</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        Pending Review
                      </span>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">
                      &ldquo;The biggest mistake I see founders make is confusing being busy with being productive...&rdquo;
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                      <div className="text-lg font-bold text-white">12</div>
                      <div className="text-xs text-white/40">Posts</div>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                      <div className="text-lg font-bold text-violet-400">98%</div>
                      <div className="text-xs text-white/40">Voice Match</div>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                      <div className="text-lg font-bold text-green-400">4.2K</div>
                      <div className="text-xs text-white/40">Impressions</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-8 rounded-xl bg-[#0e0e0e] border border-white/10 p-4 shadow-xl shadow-black/40" style={{ width: 200 }}>
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-medium text-white/80">Voice Memo</span>
                </div>
                <div className="flex items-center gap-1">
                  {[3, 5, 8, 4, 7, 6, 3, 8, 5, 4, 6, 7, 3, 5, 8].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-violet-500/60"
                      style={{ height: h * 3 }}
                    />
                  ))}
                </div>
                <div className="text-xs text-white/30 mt-2">0:47 / 1:02</div>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      <section className="section-light py-12">
        <p className="text-center text-sm text-gray-400 mb-6 font-medium uppercase tracking-wider">
          Trusted by founders from
        </p>
        <LogoMarquee />
      </section>

      <section id="features" className="section-light py-12 lg:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <FadeInView>
              <SectionBadge>Everything you need</SectionBadge>
            </FadeInView>
            <FadeInView delay={0.1}>
              <h2 className="mt-6 text-3xl md:text-4xl lg:text-[40px] font-extrabold text-gray-900 tracking-tight leading-[1.2]">
                From voice memo to<br />viral post in minutes
              </h2>
            </FadeInView>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeInView delay={0}>
              <div className="feature-card h-full">
                <div className="rounded-2xl bg-[#0d0d10] border border-white/5 p-5 mb-6 h-48 flex flex-col gap-3 overflow-hidden relative">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-white/30 text-xs ml-2">AI Output</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/80 text-xs font-medium feature-line-1">We cut our sales team in half...</div>
                    <div className="text-white/60 text-xs feature-line-2">Here&apos;s the counterintuitive reason</div>
                    <div className="text-white/60 text-xs feature-line-3">why it <span style={{ color: "#E855A0" }}>tripled our revenue:</span></div>
                    <div className="text-white/40 text-xs feature-line-4">↓ Thread</div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0d0d10] to-transparent" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Voice-First Creation</h3>
                <p className="text-gray-500 leading-relaxed">Record a quick voice memo on WhatsApp. Our AI captures your unique tone, cadence, and personality.</p>
              </div>
            </FadeInView>

            <FadeInView delay={0.1}>
              <div className="feature-card h-full">
                <div className="rounded-2xl bg-[#0d0d10] border border-white/5 p-5 mb-6 h-48 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                  <div className="flex items-center gap-1">
                    {[4, 7, 12, 18, 24, 30, 24, 18, 30, 24, 12, 18, 24, 12, 7, 4].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-full feature-bar"
                        style={{
                          height: h,
                          background: "#E855A0",
                          opacity: 0.7 + (i % 3) * 0.1,
                          animationDelay: `${i * 0.08}s`
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-white/50 text-xs">Processing your voice...</div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(232,85,160,0.12) 0%, transparent 70%)" }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Instant LinkedIn Posts</h3>
                <p className="text-gray-500 leading-relaxed">Get polished, ready-to-publish LinkedIn content in seconds. Review, edit, and post — all from one dashboard.</p>
              </div>
            </FadeInView>

            <FadeInView delay={0.2}>
              <div className="feature-card h-full">
                <div className="rounded-2xl bg-[#0d0d10] border border-white/5 p-5 mb-6 h-48 flex flex-col justify-center gap-3 relative overflow-hidden">
                  <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Voice Match Score</div>
                  <div className="space-y-2">
                    {[
                      { label: "Tone", val: 98 },
                      { label: "Vocabulary", val: 94 },
                      { label: "Rhythm", val: 91 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-white/50 text-xs w-20">{item.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full feature-score-bar"
                            style={{ width: `${item.val}%`, background: "linear-gradient(90deg, #E855A0, #a855f7)" }}
                          />
                        </div>
                        <span className="text-white/60 text-xs w-8 text-right">{item.val}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-4 right-4 text-2xl font-black text-white/5 select-none">98%</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Voice, Protected</h3>
                <p className="text-gray-500 leading-relaxed">We learn YOUR style, not a generic template. Every post sounds authentically like you — because it is.</p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-light py-12 lg:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <FadeInView>
            <div className="rounded-3xl bg-gradient-to-br from-[#0f0f0f] to-[#1a1020] p-12 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-6">
                  <MessageSquare className="w-5 h-5 text-white/60" />
                  <span className="text-white/60 text-sm font-medium">WhatsApp → LinkedIn</span>
                </div>
                <div className="flex items-center gap-4 justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Mic className="w-7 h-7 text-green-400" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-white/20" />
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Activity className="w-7 h-7 text-violet-400" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-white/20" />
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Send className="w-7 h-7 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </FadeInView>

          <div>
            <FadeInView>
              <div className="flex justify-center md:justify-start">
                <SectionBadge>How it works</SectionBadge>
              </div>
              <h2 className="mt-6 text-3xl md:text-4xl lg:text-[40px] font-extrabold text-gray-900 tracking-tight text-center md:text-left leading-[1.2]">
                A simple setup that<br />
                gets you posting fast
              </h2>
              <p className="mt-4 text-gray-500 text-base md:text-lg max-w-md text-center md:text-left mx-auto md:mx-0 leading-relaxed">
                Set it up once, connect WhatsApp, and start turning every idea into content.
              </p>
            </FadeInView>

            <div className="mt-10 space-y-8">
              {steps.map((step, i) => (
                <FadeInView key={step.num} delay={i * 0.15}>
                  <div className="flex gap-5">
                    <div>
                      <div className="step-number">{step.num}</div>
                      {i < steps.length - 1 && (
                        <div className="w-px h-12 bg-gray-200 ml-5 mt-2" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                      <p className="text-gray-500 mt-1 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-light py-12 lg:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div className="text-center md:text-left">
              <FadeInView>
                <div className="flex justify-center md:justify-start">
                  <SectionBadge>Product overview</SectionBadge>
                </div>
                <h2 className="mt-6 text-3xl md:text-4xl lg:text-[40px] font-extrabold text-gray-900 tracking-tight leading-[1.2]">
                  The foundation of your<br />content operations
                </h2>
              </FadeInView>
            </div>
            <FadeInView delay={0.2} className="flex justify-center md:justify-end">
              <Link href="/dashboard" className="btn-arrow btn-arrow-dark mt-6 md:mt-0">
                <span className="btn-arrow-icon">
                  <ArrowRight className="w-5 h-5" />
                </span>
                <span className="btn-arrow-text">Get started now</span>
              </Link>
            </FadeInView>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productFeatures.map((f, i) => (
              <FadeInView key={f.title} delay={i * 0.1}>
                <div className="feature-card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`icon-box ${f.color}`}>
                      <f.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{f.title}</h3>
                  </div>
                  <p className="text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              </FadeInView>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {featureHighlights.map((fh, i) => (
              <FadeInView key={fh.title} delay={i * 0.05}>
                <div className="feature-card text-center py-8">
                  <fh.icon className="w-6 h-6 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-1">{fh.title}</h4>
                  <p className="text-sm text-gray-500">{fh.description}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      <section id="ai" className="section-dark py-12 lg:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <FadeInView>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                  Beta
                </span>
                <SectionBadge>AI Automation</SectionBadge>
              </div>
            </FadeInView>
            <FadeInView delay={0.1}>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-[1.2]">
                AI that captures your<br />authentic voice
              </h2>
              <p className="mt-4 text-white/40 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Skip the writer&apos;s block. Your voice memos become polished content automatically.
              </p>
            </FadeInView>
          </div>

          <FadeInView delay={0.2}>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {aiTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`ai-tab ${activeAiTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveAiTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </FadeInView>

          <FadeInView delay={0.3}>
            <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 md:p-12">
              <h3 className="text-2xl font-bold text-white mb-4">{activeTabData.title}</h3>
              <p className="text-white/50 leading-relaxed mb-6">{activeTabData.description}</p>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">Benefits</p>
                {activeTabData.benefits.map((b) => (
                  <div key={b} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span className="text-white/60">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>

          <FadeInView delay={0.4}>
            <div className="text-center mt-10">
              <Link href="#waitlist" className="btn-outline inline-flex">
                Join the waitlist
              </Link>
            </div>
          </FadeInView>
        </div>
      </section>

      <section className="section-light py-12 lg:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 md:p-8 md:gap-12 items-center text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start">
              <FadeInView>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                  What founders achieve with FounderVoice
                </h2>
                <Link href="#waitlist" className="btn-arrow btn-arrow-dark mt-6 inline-flex mx-auto lg:mx-0">
                  <span className="btn-arrow-icon">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                  <span className="btn-arrow-text">Get started — it&apos;s free</span>
                </Link>
              </FadeInView>
            </div>
            {stats.map((stat, i) => (
              <FadeInView key={stat.label} delay={i * 0.1}>
                <div className="flex flex-col items-center lg:items-start gap-3">
                  <div className={`icon-box ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-4xl md:text-5xl font-extrabold text-gray-900">{stat.value}</div>
                  <div>
                    <div className="font-bold text-gray-900">{stat.label}</div>
                    <div className="text-sm text-gray-500">{stat.sub}</div>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      <section className="section-light py-12 lg:py-16 md:py-24 border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="text-center md:text-left">
            <FadeInView>
              <div className="flex justify-center md:justify-start">
                <SectionBadge>Built for founders</SectionBadge>
              </div>
              <h2 className="mt-6 text-3xl md:text-4xl lg:text-[40px] font-extrabold text-gray-900 tracking-tight leading-[1.2]">
                One platform that fits<br />many voices
              </h2>
              <p className="mt-4 text-gray-500 text-base md:text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
                Different founders use FounderVoice in different ways, but the goal stays the same: authentic content, zero effort.
              </p>
            </FadeInView>

            <FadeInView delay={0.2}>
              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                {roles.map((role) => (
                  <span key={role} className="pill-tag">{role}</span>
                ))}
                <span className="pill-tag pill-tag-filled">More+</span>
              </div>
            </FadeInView>
          </div>

          <FadeInView delay={0.3}>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 md:p-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Multi-voice profiles</div>
                    <div className="text-sm text-gray-500">Each founder gets their own voice AI</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Works in any niche</div>
                    <div className="text-sm text-gray-500">Tech, finance, health, coaching, SaaS, and more</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Scales with your growth</div>
                    <div className="text-sm text-gray-500">From solo founder to full content team</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      <section id="pricing" className="section-light py-12 lg:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <FadeInView>
              <div className="flex justify-center">
                <SectionBadge>Pricing</SectionBadge>
              </div>
            </FadeInView>
            <FadeInView delay={0.1}>
              <h2 className="mt-6 text-3xl md:text-4xl lg:text-[40px] font-extrabold text-gray-900 tracking-tight leading-[1.2]">
                Simple pricing that<br />grows with you
              </h2>
            </FadeInView>
            <FadeInView delay={0.2}>
              <div className="mt-8 mb-4 inline-flex">
                <div className="pricing-toggle rounded-full flex items-center p-1 border border-gray-200 bg-white shadow-sm overflow-visible relative">
                  <button
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${billingPeriod === "monthly" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                    onClick={() => setBillingPeriod("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors relative ${billingPeriod === "yearly" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                    onClick={() => setBillingPeriod("yearly")}
                  >
                    Yearly
                    <span className="absolute -top-3 -right-6 text-[10px] px-2.5 py-1 rounded-full text-white font-bold shadow-md animate-bounce" style={{ background: "linear-gradient(135deg, #E855A0, #a855f7)" }}>
                      20% OFF
                    </span>
                  </button>
                </div>
              </div>
            </FadeInView>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans[billingPeriod].map((plan, i) => (
              <FadeInView key={plan.name} delay={i * 0.1}>
                <PricingCard
                  name={plan.name}
                  price={plan.price}
                  period={billingPeriod === "monthly" ? "mo" : "mo"}
                  description={plan.description}
                  features={plan.features}
                  featured={plan.featured}
                  ctaText="Start free trial"
                />
              </FadeInView>
            ))}
          </div>

          <FadeInView delay={0.3}>
            <div className="max-w-3xl mx-auto mt-12 text-center border-t border-gray-200/60 pt-8">
              <p className="text-gray-500 text-sm font-medium flex items-center justify-center gap-2">
                <span className="w-4 h-px bg-gray-300"></span>
                Trusted by founders from Stripe, Notion, and Linear
                <span className="w-4 h-px bg-gray-300"></span>
              </p>
            </div>
          </FadeInView>
        </div>
      </section>

      <section id="reviews" className="section-light py-12 lg:py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-col items-center text-center md:flex-row md:items-end md:text-left md:justify-between">
            <div>
              <FadeInView>
                <div className="flex justify-center md:justify-start">
                  <SectionBadge>Reviews</SectionBadge>
                </div>
                <h2 className="mt-6 text-3xl md:text-4xl lg:text-[40px] font-extrabold text-gray-900 tracking-tight leading-[1.2]">
                  Trusted by founders<br />who ship content
                </h2>
              </FadeInView>
            </div>
            <FadeInView delay={0.2}>
              <div className="flex items-center justify-center gap-4 mt-8 md:mt-0">
                <span className="text-5xl font-extrabold text-gray-900">4.9</span>
                <div className="text-left">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Review by 240+ founders</p>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((t, i) => (
            <FadeInView key={t.name} delay={i * 0.08}>
              <div className="flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-base leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                </div>
              </div>
            </FadeInView>
          ))}
        </div>
      </section>

      <section id="faq" className="section-light py-12 lg:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
          <div className="text-center md:text-left">
            <FadeInView>
              <div className="flex justify-center md:justify-start">
                <SectionBadge>FAQs</SectionBadge>
              </div>
              <h2 className="mt-6 text-3xl md:text-4xl lg:text-[56px] font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                Answers to<br />common questions
              </h2>
            </FadeInView>

            <FadeInView delay={0.2}>
              <div className="mt-10 rounded-2xl bg-white border border-gray-100 p-6 md:p-8 inline-block shadow-sm text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Can&apos;t find your answer?
                </h3>
                <Link href="#" className="btn-arrow btn-arrow-dark mx-auto md:mx-0">
                  <span className="btn-arrow-icon">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                  <span className="btn-arrow-text">Talk to us</span>
                </Link>
              </div>
            </FadeInView>
          </div>

          <FadeInView delay={0.1}>
            <FaqAccordion items={faqItems} />
          </FadeInView>
        </div>
      </section>

      <section id="waitlist" className="relative py-16 md:py-24 overflow-hidden" style={{ background: "#0a0a0f" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #E855A0 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <FadeInView>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              7-day free trial &mdash; no credit card
            </div>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h2 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-tight leading-[1.05] mb-6 mx-auto text-center">
              Your voice.
              <br />
              <span style={{ background: "linear-gradient(135deg, #E855A0, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Everywhere.
              </span>
            </h2>
          </FadeInView>
          <FadeInView delay={0.2}>
            <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed text-center">
              Stop staring at a blank screen. Send a voice memo. Get a LinkedIn post that sounds exactly like you — in under 60 seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard" className="inline-flex items-center px-7 py-3.5 rounded-full text-white font-semibold text-sm transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(232,85,160,0.4)]" style={{ background: "#E855A0" }}>
                Start free trial
              </Link>
              <Link href="#" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white/70 font-semibold text-sm border border-white/10 hover:border-white/20 hover:text-white transition-all">
                <MessageSquare className="w-4 h-4" />
                Book a demo
              </Link>
            </div>
          </FadeInView>
        </div>
      </section>

      <footer className="footer-card px-6 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:p-8 md:gap-12">
          <div>
            <h4 className="font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="footer-link">Home</Link></li>
              <li><Link href="/#features" className="footer-link">Features</Link></li>
              <li><Link href="/#how-it-works" className="footer-link">AI Automation</Link></li>
              <li><Link href="/#pricing" className="footer-link">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="footer-link">About</Link></li>
              <li><Link href="/blog" className="footer-link">Blog</Link></li>
              <li><Link href="/#waitlist" className="footer-link">Waitlist</Link></li>
              <li><Link href="/changelog" className="footer-link">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/#faq" className="footer-link">FAQs</Link></li>
              <li><Link href="/contact" className="footer-link">Contact</Link></li>
              <li><Link href="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link href="/terms" className="footer-link">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Stay updated</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/25"
              />
              <button className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors">
                <Send className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <label className="flex items-start gap-2 mt-3 cursor-pointer">
              <input type="checkbox" className="mt-1 rounded border-white/20" />
              <span className="text-xs text-white/30">I consent to receive newsletters and updates.</span>
            </label>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-white/20 text-sm">
          © 2026 FounderVoice AI. Built for founders who build.
        </div>
      </footer>
    </div>
  );
}
