import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { AuthenticationSimulator } from "@/components/auth/AuthenticationSimulator";
import { api } from "@/lib/api";

vi.mock("@/lib/api", async () => {
    const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
    return {
        ...actual,
        api: {
            ...actual.api,
            verifyBiometric: vi.fn(),
            identifyBiometric: vi.fn(),
        },
    };
});

describe("AuthenticationSimulator", () => {
    it("submits verify mode and renders response", async () => {
        const verifyMock = vi.mocked(api.verifyBiometric);
        verifyMock.mockResolvedValueOnce({
            subject_id: "subject-1",
            policy: "score_level",
            fused_score: 0.91,
            adjusted_threshold: 0.75,
            decision: "accept",
            evidence: [],
            factors: {},
        });

        render(<AuthenticationSimulator />);

        fireEvent.click(screen.getByRole("button", { name: /run verify/i }));

        await waitFor(() => {
            expect(verifyMock).toHaveBeenCalledTimes(1);
        });

        expect(await screen.findByText(/"decision": "accept"/i)).toBeInTheDocument();
    });

    it("switches to identify mode and submits identify request", async () => {
        const identifyMock = vi.mocked(api.identifyBiometric);
        identifyMock.mockResolvedValueOnce({
            matches: [{ subject_id: "candidate-1", score: 0.92, adjusted_threshold: 0.75, decision: "match", rank: 1 }],
            top_match: { subject_id: "candidate-1", score: 0.92, adjusted_threshold: 0.75, decision: "match", rank: 1 },
        });

        render(<AuthenticationSimulator />);

        fireEvent.change(screen.getByLabelText(/mode/i), { target: { value: "identify" } });
        fireEvent.click(screen.getByRole("button", { name: /run identify/i }));

        await waitFor(() => {
            expect(identifyMock).toHaveBeenCalledTimes(1);
        });

        expect(await screen.findByText(/"subject_id": "candidate-1"/i)).toBeInTheDocument();
    });
});
