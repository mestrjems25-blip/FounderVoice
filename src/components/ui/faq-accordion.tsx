"use client";

import { useState } from "react";

interface FaqItem {
    question: string;
    answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div>
            {items.map((item, i) => (
                <div key={item.question} className="faq-item">
                    <button
                        className="faq-question"
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    >
                        <span>{item.question}</span>
                        <span
                            className="faq-toggle"
                            style={{
                                transform: openIndex === i ? "rotate(45deg)" : "none",
                            }}
                        >
                            +
                        </span>
                    </button>
                    <div className={`faq-answer ${openIndex === i ? "open" : ""}`}>
                        <p className="text-gray-600 text-base leading-relaxed pr-12">
                            {item.answer}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
