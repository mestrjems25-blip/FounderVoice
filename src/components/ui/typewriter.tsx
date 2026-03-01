"use client";

import { useState, useEffect } from "react";

const words = ["LinkedIn Posts", "Viral Content", "Brand Stories", "Founder Content"];

export function Typewriter() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = words[currentIndex];
        const typingSpeed = isDeleting ? 40 : 80;

        if (!isDeleting && displayText === currentWord) {
            const timeout = setTimeout(() => setIsDeleting(true), 2000);
            return () => clearTimeout(timeout);
        }

        if (isDeleting && displayText === "") {
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setDisplayText(
                isDeleting
                    ? currentWord.substring(0, displayText.length - 1)
                    : currentWord.substring(0, displayText.length + 1)
            );
        }, typingSpeed);

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, currentIndex]);

    return (
        <span className="typewriter-word text-[24px] md:text-[32px]">
            {displayText}
            <span className="typewriter-cursor" />
        </span>
    );
}
