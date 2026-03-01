export function SectionBadge({ children }: { children: React.ReactNode }) {
    return (
        <div className="section-badge">
            <span className="opacity-40">•</span>
            {children}
            <span className="opacity-40">•</span>
        </div>
    );
}
