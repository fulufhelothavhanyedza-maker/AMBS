"use client";

import { useMemo, useState } from "react";
import { api, type IdentifyResponse, type VerifyResponse } from "@/lib/api";

type Mode = "verify" | "identify";
type Modality = "face" | "gait";

function parseEmbedding(raw: string): number[] {
    return raw
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value));
}

export function AuthenticationSimulator() {
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("");
    const [authMessage, setAuthMessage] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [mode, setMode] = useState<Mode>("verify");
    const [modality, setModality] = useState<Modality>("face");
    const [probeEmbedding, setProbeEmbedding] = useState("0.91,0.82,0.73");
    const [referenceEmbedding, setReferenceEmbedding] = useState("0.9,0.8,0.7");
    const [candidateSubjectId, setCandidateSubjectId] = useState("candidate-1");
    const [policy, setPolicy] = useState("score_level");
    const [riskScore, setRiskScore] = useState("0.15");
    const [environmentQuality, setEnvironmentQuality] = useState("0.92");
    const [result, setResult] = useState<VerifyResponse | IdentifyResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const probe = useMemo(() => parseEmbedding(probeEmbedding), [probeEmbedding]);
    const reference = useMemo(() => parseEmbedding(referenceEmbedding), [referenceEmbedding]);

    async function authenticate() {
        setAuthMessage(null);

        if (!username || !password) {
            setAuthMessage("Enter username and password to authenticate.");
            return;
        }

        setIsAuthenticating(true);
        try {
            const response = await api.login({ username, password });
            api.setToken(response.token);
            setAuthMessage(`Authenticated as ${response.user.fullName || response.user.username}.`);
            setPassword("");
        } catch (authError) {
            setAuthMessage(authError instanceof Error ? authError.message : "Authentication failed.");
        } finally {
            setIsAuthenticating(false);
        }
    }

    function clearAuthentication() {
        api.clearToken();
        setAuthMessage("Stored token cleared.");
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setResult(null);

        if (probe.length === 0 || reference.length === 0) {
            setError("Probe and reference embeddings must contain numeric values.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (mode === "verify") {
                const response = await api.verifyBiometric({
                    probeSamples: [{ modality, embedding: probe }],
                    referenceSamples: [{ modality, embedding: reference }],
                    policy,
                    riskScore: Number(riskScore),
                    environmentQuality: Number(environmentQuality),
                });
                setResult(response);
            } else {
                const response = await api.identifyBiometric({
                    probeSamples: [{ modality, embedding: probe }],
                    candidates: [
                        {
                            subject_id: candidateSubjectId,
                            reference_samples: [{ modality, embedding: reference }],
                        },
                    ],
                    policy,
                    topK: 3,
                    riskScore: Number(riskScore),
                    environmentQuality: Number(environmentQuality),
                });
                setResult(response);
            }
        } catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : "Authentication request failed.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <form className="panel-soft grid gap-4 p-4" onSubmit={onSubmit}>
                <div className="rounded-md border border-[var(--line)] bg-white/80 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">API Authentication</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <label className="grid gap-1">
                            <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Username</span>
                            <input
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                            />
                        </label>

                        <label className="grid gap-1">
                            <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Password</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                            />
                        </label>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => authenticate().catch(() => null)}
                            disabled={isAuthenticating}
                            className="rounded-md border border-[var(--line)] bg-[var(--brand)] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
                        >
                            {isAuthenticating ? "Signing in..." : "Sign in"}
                        </button>
                        <button
                            type="button"
                            onClick={clearAuthentication}
                            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-xs font-medium uppercase tracking-[0.12em]"
                        >
                            Clear token
                        </button>
                    </div>

                    {authMessage ? <p className="mt-2 text-xs text-[var(--muted)]">{authMessage}</p> : null}
                </div>

                <div className="grid gap-2">
                    <label htmlFor="auth-mode" className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                        Mode
                    </label>
                    <select
                        id="auth-mode"
                        value={mode}
                        onChange={(event) => setMode(event.target.value as Mode)}
                        className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                    >
                        <option value="verify">Verify</option>
                        <option value="identify">Identify</option>
                    </select>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                    <label className="grid gap-2">
                        <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Modality</span>
                        <select
                            value={modality}
                            onChange={(event) => setModality(event.target.value as Modality)}
                            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                        >
                            <option value="face">Face</option>
                            <option value="gait">Gait</option>
                        </select>
                    </label>

                    <label className="grid gap-2">
                        <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Policy</span>
                        <input
                            value={policy}
                            onChange={(event) => setPolicy(event.target.value)}
                            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                        />
                    </label>
                </div>

                <label className="grid gap-2">
                    <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Probe Embedding</span>
                    <input
                        value={probeEmbedding}
                        onChange={(event) => setProbeEmbedding(event.target.value)}
                        className="mono rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Reference Embedding</span>
                    <input
                        value={referenceEmbedding}
                        onChange={(event) => setReferenceEmbedding(event.target.value)}
                        className="mono rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                    />
                </label>

                {mode === "identify" ? (
                    <label className="grid gap-2">
                        <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Candidate Subject ID</span>
                        <input
                            value={candidateSubjectId}
                            onChange={(event) => setCandidateSubjectId(event.target.value)}
                            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                        />
                    </label>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-2">
                    <label className="grid gap-2">
                        <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Risk Score (0-1)</span>
                        <input
                            value={riskScore}
                            onChange={(event) => setRiskScore(event.target.value)}
                            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Environment Quality (0-1)</span>
                        <input
                            value={environmentQuality}
                            onChange={(event) => setEnvironmentQuality(event.target.value)}
                            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
                >
                    {isSubmitting ? "Running..." : `Run ${mode}`}
                </button>
            </form>

            <div className="panel-soft p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Result Console</p>
                {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
                {!error && !result ? (
                    <p className="mt-3 text-sm text-[var(--muted)]">Submit a simulation to inspect policy-adjusted output.</p>
                ) : null}
                {result ? (
                    <pre className="mono mt-3 overflow-x-auto rounded-md border border-[var(--line)] bg-white p-3 text-xs">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                ) : null}
            </div>
        </div>
    );
}
