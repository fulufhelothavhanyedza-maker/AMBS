import { SectionCard } from "@/components/ui/SectionCard";

export default function SettingsPage() {
    return (
        <SectionCard
            title="Policy Settings"
            subtitle="Threshold governance and adaptive profile controls"
        >
            <p className="text-sm text-[var(--muted)]">
                Design system is prepared for policy forms powered by `/api/configuration` and fusion profile endpoints.
            </p>
        </SectionCard>
    );
}
