import { SectionCard } from "@/components/ui/SectionCard";

export default function AuditPage() {
    return (
        <SectionCard
            title="Audit Timeline"
            subtitle="Immutable event stream for operator actions and biometric decisions"
        >
            <p className="text-sm text-[var(--muted)]">
                Endpoint binding planned for `/api/audit/logs` with filter chips and trace drill-down.
            </p>
        </SectionCard>
    );
}
