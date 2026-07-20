import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { EnrollmentDashboard } from "@/components/enrolment/EnrollmentDashboard";
import { api } from "@/lib/api";

vi.mock("@/lib/api", async () => {
    const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
    return {
        ...actual,
        api: {
            ...actual.api,
            getEnrolmentSubjects: vi.fn(),
            getEnrolmentRecords: vi.fn(),
            getBiometricTemplates: vi.fn(),
            createEnrolmentSubject: vi.fn(),
            createEnrolmentRecord: vi.fn(),
            revokeBiometricTemplate: vi.fn(),
        },
    };
});

function seedApi() {
    vi.mocked(api.getEnrolmentSubjects).mockResolvedValue({
        subjects: [
            {
                id: "sub-1",
                external_reference: "SUBJ-1001",
                first_name: "Amina",
                last_name: "Mbatha",
                email: null,
                phone: null,
                status: "active",
                created_at: new Date().toISOString(),
            },
        ],
    });
    vi.mocked(api.getEnrolmentRecords).mockResolvedValue({ enrolments: [] });
    vi.mocked(api.getBiometricTemplates).mockResolvedValue({ templates: [] });
}

describe("EnrollmentDashboard", () => {
    it("loads enrollment data on mount", async () => {
        seedApi();

        render(<EnrollmentDashboard />);

        await waitFor(() => {
            expect(api.getEnrolmentSubjects).toHaveBeenCalledTimes(1);
            expect(api.getEnrolmentRecords).toHaveBeenCalledTimes(1);
            expect(api.getBiometricTemplates).toHaveBeenCalledTimes(1);
        });
    });

    it("submits subject creation", async () => {
        seedApi();
        vi.mocked(api.createEnrolmentSubject).mockResolvedValue({
            subject: {
                id: "sub-2",
                external_reference: "SUBJ-1002",
                first_name: "John",
                last_name: "Doe",
                email: null,
                phone: null,
                status: "active",
                created_at: new Date().toISOString(),
            },
        });

        render(<EnrollmentDashboard />);

        await screen.findByRole("button", { name: /create subject/i });

        fireEvent.change(screen.getByPlaceholderText(/external reference/i), { target: { value: "SUBJ-2001" } });
        fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: "Lindi" } });
        fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: "Moyo" } });

        fireEvent.click(screen.getByRole("button", { name: /create subject/i }));

        await waitFor(() => {
            expect(api.createEnrolmentSubject).toHaveBeenCalledTimes(1);
        });
    });
});
