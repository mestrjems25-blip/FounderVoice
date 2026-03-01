export interface VoiceStyle {
    tone?: "professional" | "casual" | "provocative" | "inspirational";
    formatting?: "bullet-points" | "story" | "listicle" | "thread";
    signature?: string;
    avoidWords?: string[];
}

export interface GeneratePostInput {
    rawTranscript: string;
    voiceStyle?: VoiceStyle;
    maxLength?: number;
}

export interface GeneratePostOutput {
    content: string;
    wordCount: number;
    charCount: number;
    estimatedReadTime: string;
}

export async function generatePost(input: GeneratePostInput): Promise<GeneratePostOutput> {
    const content = formatTranscript(input.rawTranscript);
    const wordCount = content.split(/\s+/).length;

    return {
        content,
        wordCount,
        charCount: content.length,
        estimatedReadTime: `${Math.ceil(wordCount / 200)} min read`,
    };
}

function formatTranscript(transcript: string): string {
    const sentences = transcript
        .split(/\.\s+/)
        .filter(Boolean)
        .map((s) => s.trim());

    if (sentences.length === 0) return transcript;

    const hook = sentences[0] + ".";
    const body = sentences
        .slice(1)
        .map((s) => `→ ${s}.`)
        .join("\n");

    return `${hook}\n\n${body}\n\nWhat's your take? 👇`;
}
