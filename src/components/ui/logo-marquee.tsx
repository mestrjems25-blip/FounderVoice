"use client";

const logos = [
    "TechCrunch", "Forbes", "YCombinator", "ProductHunt", "Stripe",
    "Notion", "Linear", "Vercel", "Figma", "OpenAI",
];

export function LogoMarquee() {
    return (
        <div className="marquee-container py-8">
            <div className="marquee-track">
                {[...logos, ...logos].map((name, i) => (
                    <div
                        key={`${name}-${i}`}
                        className="flex items-center justify-center px-6 opacity-30 hover:opacity-60 transition-opacity"
                    >
                        <span className="text-lg font-bold tracking-wider text-black/60 uppercase whitespace-nowrap">
                            {name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
