import type { ReactNode } from "react";

type SectionCardProps = {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    children: ReactNode;
};

export function SectionCard({ title, subtitle, actions, children }: SectionCardProps) {
    return (
        <section className="panel p-5 md:p-6">
            <header className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                    {subtitle ? <p className="text-sm text-[var(--muted)]">{subtitle}</p> : null}
                </div>
                {actions ? <div>{actions}</div> : null}
            </header>
            {children}
        </section>
    );
}
