type MetricTileProps = {
    label: string;
    value: string;
    trend?: string;
    tone?: "brand" | "accent" | "neutral" | "danger";
};

const toneMap = {
    brand: "text-[var(--brand)]",
    accent: "text-[var(--accent)]",
    neutral: "text-[var(--ink)]",
    danger: "text-[var(--danger)]",
};

export function MetricTile({ label, value, trend, tone = "neutral" }: MetricTileProps) {
    return (
        <article className="panel-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
            <p className={`kpi-value mt-2 font-semibold ${toneMap[tone]}`}>{value}</p>
            {trend ? <p className="mono mt-2 text-xs text-[var(--muted)]">{trend}</p> : null}
        </article>
    );
}
