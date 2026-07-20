import { SectionCard } from "@/components/ui/SectionCard";

export default function UsersPage() {
    return (
        <SectionCard
            title="Identity Operators"
            subtitle="Role management, session oversight, and operator access posture"
        >
            <p className="text-sm text-[var(--muted)]">
                UI foundation complete. Phase 7 will bind this surface to `/api/users` and add editing workflows.
            </p>
        </SectionCard>
    );
}
