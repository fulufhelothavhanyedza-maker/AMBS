import { SectionCard } from "@/components/ui/SectionCard";
import { EnrollmentDashboard } from "@/components/enrolment/EnrollmentDashboard";

export default function EnrolmentPage() {
    return (
        <SectionCard
            title="Enrollment Studio"
            subtitle="Capture quality context, feature vectors, and template versioning"
        >
            <EnrollmentDashboard />
        </SectionCard>
    );
}
