import Link from "next/link";
import { portalNavigation } from "@/lib/navigation";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="portal-shell">
            <aside className="portal-sidebar p-4 md:p-5">
                <div className="panel p-4">
                    <p className="mono text-xs uppercase tracking-[0.15em] text-[var(--muted)]">AMBS Control</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--brand)]">Biometric Mission</h1>
                    <p className="mt-2 text-sm text-[var(--muted)]">Adaptive multimodal identity operations center.</p>
                </div>
                <nav className="mt-4 grid gap-2">
                    {portalNavigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="panel-soft px-3 py-2 text-sm transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="portal-main">
                <div className="mx-auto w-full max-w-6xl">{children}</div>
            </main>
        </div>
    );
}
