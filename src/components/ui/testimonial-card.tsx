interface TestimonialProps {
    quote: string;
    name: string;
    role: string;
    variant?: "photo" | "text";
    imageIndex?: number;
}

const gradients = [
    "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
    "linear-gradient(135deg, #0d1117, #161b22, #21262d)",
];

export function TestimonialCard({
    quote,
    name,
    role,
    variant = "text",
    imageIndex = 0,
}: TestimonialProps) {
    if (variant === "photo") {
        return (
            <div className="testimonial-card">
                <div
                    className="testimonial-card-photo"
                    style={{ background: gradients[imageIndex % gradients.length] }}
                >
                    <p className="text-white text-lg font-medium leading-relaxed">
                        &ldquo;{quote}&rdquo;
                    </p>
                    <div>
                        <p className="text-white font-semibold">{name}</p>
                        <p className="text-white/60 text-sm">{role}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="testimonial-card">
            <div className="testimonial-card-text">
                <p className="text-gray-900 text-lg font-medium leading-relaxed">
                    &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{name}</p>
                        <p className="text-gray-500 text-sm">{role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
