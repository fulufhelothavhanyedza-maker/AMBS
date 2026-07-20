import { SectionCard } from "@/components/ui/SectionCard";
import { AuthenticationSimulator } from "@/components/auth/AuthenticationSimulator";

export default function AuthenticationPage() {
    return (
        <SectionCard
            title="Authentication Lab"
            subtitle="Probe simulation, policy selection, and verification/identification replay"
        >
            <AuthenticationSimulator />
        </SectionCard>
    );
}
