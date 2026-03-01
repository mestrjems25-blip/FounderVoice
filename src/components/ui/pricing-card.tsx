"use client";

import { Check } from "lucide-react";

interface PricingCardProps {
    name: string;
    price: number;
    period: string;
    description: string;
    features: string[];
    featured?: boolean;
    ctaText?: string;
}

export function PricingCard({
    name,
    price,
    period,
    description,
    features,
    featured = false,
    ctaText = "Get started",
}: PricingCardProps) {
    return (
        <div className={featured ? "pricing-card pricing-card-featured" : "pricing-card"}>
            {featured && (
                <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/10 text-white border border-white/20">
                        Most popular
                    </span>
                </div>
            )}
            <h3 className={`text-xl font-bold mb-1 ${featured ? "text-white" : "text-gray-900"}`}>
                {name}
            </h3>
            <p className={`text-sm mb-6 ${featured ? "text-white/60" : "text-gray-500"}`}>
                {description}
            </p>
            <div className="mb-6">
                <span className={`text-5xl font-extrabold ${featured ? "text-white" : "text-gray-900"}`}>
                    ${price}
                </span>
                <span className={`text-sm ml-2 ${featured ? "text-white/50" : "text-gray-400"}`}>
                    /{period}
                </span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
                {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                        <Check
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${featured ? "text-violet-400" : "text-green-500"
                                }`}
                        />
                        <span className={`text-sm ${featured ? "text-white/80" : "text-gray-600"}`}>
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>
            <button
                className={
                    featured
                        ? "inline-flex items-center justify-center bg-white text-black font-semibold rounded-full px-8 py-3 transition-transform hover:scale-105 w-full"
                        : "inline-flex items-center justify-center bg-[#100F11] text-white font-semibold rounded-full px-8 py-3 transition-transform hover:scale-105 w-full border border-gray-200 shadow-sm"
                }
            >
                {ctaText}
            </button>
        </div>
    );
}
