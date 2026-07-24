"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type BiometricTemplate, type EnrolmentRecord, type EnrolmentSubject, type Modality } from "@/lib/api";

function parseVector(raw: string): number[] {
    return raw
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value));
}

export function EnrollmentDashboard() {
    const [subjects, setSubjects] = useState<EnrolmentSubject[]>([]);
    const [records, setRecords] = useState<EnrolmentRecord[]>([]);
    const [templates, setTemplates] = useState<BiometricTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [externalReference, setExternalReference] = useState("SUBJ-1001");
    const [firstName, setFirstName] = useState("Amina");
    const [lastName, setLastName] = useState("Mbatha");
    const [email, setEmail] = useState("amina@example.com");
    const [phone, setPhone] = useState("");

    const [subjectId, setSubjectId] = useState("");
    const [modality, setModality] = useState<Modality>("face");
    const [templateReference, setTemplateReference] = useState("tmpl-face-001");
    const [templateQuality, setTemplateQuality] = useState("0.93");
    const [featureVector, setFeatureVector] = useState("0.91,0.83,0.77");

    const [isSubmittingSubject, setIsSubmittingSubject] = useState(false);
    const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);
    const [revokeInFlightId, setRevokeInFlightId] = useState<string | null>(null);
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("");
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(api.getToken()));

    function requireTokenOrFail(): boolean {
        const token = api.getToken();
        if (!token) {
            setIsAuthenticated(false);
            setError("Sign in to continue. Use the credentials provided for AMBS operator access.");
            setIsLoading(false);
            return false;
        }

        setIsAuthenticated(true);
        return true;
    }

    async function authenticateFromEnrollment() {
        setError(null);

        if (!username || !password) {
            setError("Enter username and password to continue.");
            return;
        }

        setIsAuthenticating(true);
        try {
            const response = await api.login({ username, password });
            api.setToken(response.token);
            setIsAuthenticated(true);
            setPassword("");
            await loadAll();
        } catch (authError) {
            setError(authError instanceof Error ? authError.message : "Authentication failed.");
        } finally {
            setIsAuthenticating(false);
        }
    }

    async function loadAll() {
        setError(null);
        if (!requireTokenOrFail()) {
            return;
        }

        try {
            const [subjectsResponse, recordsResponse, templatesResponse] = await Promise.all([
                api.getEnrolmentSubjects(),
                api.getEnrolmentRecords(),
                api.getBiometricTemplates(),
            ]);
            setSubjects(subjectsResponse.subjects);
            setRecords(recordsResponse.enrolments);
            setTemplates(templatesResponse.templates);

            if (!subjectId && subjectsResponse.subjects.length > 0) {
                setSubjectId(subjectsResponse.subjects[0].id);
            }
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load enrollment data.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        let active = true;

        async function bootstrap() {
            setError(null);
            if (!requireTokenOrFail()) {
                return;
            }

            try {
                const [subjectsResponse, recordsResponse, templatesResponse] = await Promise.all([
                    api.getEnrolmentSubjects(),
                    api.getEnrolmentRecords(),
                    api.getBiometricTemplates(),
                ]);

                if (!active) {
                    return;
                }

                setSubjects(subjectsResponse.subjects);
                setRecords(recordsResponse.enrolments);
                setTemplates(templatesResponse.templates);

                if (!subjectId && subjectsResponse.subjects.length > 0) {
                    setSubjectId(subjectsResponse.subjects[0].id);
                }
            } catch (loadError) {
                if (active) {
                    setError(loadError instanceof Error ? loadError.message : "Unable to load enrollment data.");
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        void bootstrap();

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedSubjectLabel = useMemo(() => {
        const selected = subjects.find((subject) => subject.id === subjectId);
        if (!selected) {
            return "No subject selected";
        }

        return `${selected.external_reference} - ${selected.first_name} ${selected.last_name}`;
    }, [subjectId, subjects]);

    async function submitSubject(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        if (!requireTokenOrFail()) {
            return;
        }

        setIsSubmittingSubject(true);

        try {
            const response = await api.createEnrolmentSubject({
                externalReference,
                firstName,
                lastName,
                email: email || undefined,
                phone: phone || undefined,
            });
            setSubjects((previous) => [response.subject, ...previous]);
            setSubjectId(response.subject.id);
            await loadAll();
        } catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : "Failed to create subject.");
        } finally {
            setIsSubmittingSubject(false);
        }
    }

    async function submitRecord(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        if (!requireTokenOrFail()) {
            return;
        }

        const vector = parseVector(featureVector);
        if (!subjectId) {
            setError("Select a subject before enrolling a biometric template.");
            return;
        }

        if (vector.length === 0) {
            setError("Feature vector must contain numeric values.");
            return;
        }

        setIsSubmittingRecord(true);
        try {
            await api.createEnrolmentRecord({
                subjectId,
                modality,
                templateReference,
                templateQuality: Number(templateQuality),
                featureVector: vector,
                metadata: { source: "nextjs-portal" },
            });
            await loadAll();
        } catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : "Failed to create enrolment record.");
        } finally {
            setIsSubmittingRecord(false);
        }
    }

    async function revokeTemplate(templateId: string) {
        setError(null);
        if (!requireTokenOrFail()) {
            return;
        }

        setRevokeInFlightId(templateId);
        try {
            await api.revokeBiometricTemplate(templateId);
            await loadAll();
        } catch (revokeError) {
            setError(revokeError instanceof Error ? revokeError.message : "Failed to revoke template.");
        } finally {
            setRevokeInFlightId(null);
        }
    }

    return (
        <div className="space-y-4">
            {error ? <p className="rounded-md border border-[var(--danger)]/35 bg-white p-3 text-sm text-[var(--danger)]">{error}</p> : null}

            {!isAuthenticated ? (
                <section className="panel-soft grid gap-3 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Enrollment Access Sign-In</p>
                    <p className="text-sm text-[var(--muted)]">Enrollment APIs require a bearer token. Sign in to continue.</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <input
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                            placeholder="Username"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                            placeholder="Password"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => authenticateFromEnrollment().catch(() => null)}
                            disabled={isAuthenticating}
                            className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
                        >
                            {isAuthenticating ? "Signing in..." : "Sign In"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                api.clearToken();
                                setIsAuthenticated(false);
                            }}
                            className="rounded-md border border-[var(--line)] px-4 py-2 text-sm"
                        >
                            Clear Token
                        </button>
                    </div>
                </section>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
                <form className="panel-soft grid gap-3 p-4" onSubmit={submitSubject}>
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Create Subject</p>
                    <input value={externalReference} onChange={(event) => setExternalReference(event.target.value)} className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm" placeholder="External reference" />
                    <div className="grid gap-3 sm:grid-cols-2">
                        <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm" placeholder="First name" />
                        <input value={lastName} onChange={(event) => setLastName(event.target.value)} className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm" placeholder="Last name" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm" placeholder="Email" />
                        <input value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm" placeholder="Phone" />
                    </div>
                    <button type="submit" disabled={isSubmittingSubject} className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60">
                        {isSubmittingSubject ? "Creating..." : "Create Subject"}
                    </button>
                </form>

                <form className="panel-soft grid gap-3 p-4" onSubmit={submitRecord}>
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Enroll Biometric Template</p>
                    <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm">
                        <option value="">Select subject</option>
                        {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                                {subject.external_reference} - {subject.first_name} {subject.last_name}
                            </option>
                        ))}
                    </select>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <select value={modality} onChange={(event) => setModality(event.target.value as Modality)} className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm">
                            <option value="face">Face</option>
                            <option value="gait">Gait</option>
                        </select>
                        <input value={templateQuality} onChange={(event) => setTemplateQuality(event.target.value)} className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm" placeholder="Template quality (0-1)" />
                    </div>
                    <input value={templateReference} onChange={(event) => setTemplateReference(event.target.value)} className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm" placeholder="Template reference" />
                    <input value={featureVector} onChange={(event) => setFeatureVector(event.target.value)} className="mono rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm" placeholder="Feature vector, comma separated" />
                    <button type="submit" disabled={isSubmittingRecord} className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60">
                        {isSubmittingRecord ? "Enrolling..." : "Enroll Template"}
                    </button>
                </form>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
                <section className="panel-soft p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Templates</p>
                        <p className="text-xs text-[var(--muted)]">Subject: {selectedSubjectLabel}</p>
                    </div>
                    <div className="mt-3 grid gap-2">
                        {isLoading ? <p className="text-sm text-[var(--muted)]">Loading templates...</p> : null}
                        {!isLoading && templates.length === 0 ? <p className="text-sm text-[var(--muted)]">No templates yet.</p> : null}
                        {templates.map((template) => (
                            <article key={template.id} className="rounded-md border border-[var(--line)] bg-white p-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium">{template.external_reference} / {template.modality}</p>
                                        <p className="mono text-xs text-[var(--muted)]">ref={template.template_reference} dim={template.vector_dimension} quality={template.template_quality ?? "n/a"}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => revokeTemplate(template.id)}
                                        disabled={revokeInFlightId === template.id || template.status === "revoked"}
                                        className="rounded-md border border-[var(--line)] px-3 py-1 text-xs text-[var(--ink)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-55"
                                    >
                                        {template.status === "revoked" ? "Revoked" : revokeInFlightId === template.id ? "Revoking..." : "Revoke"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="panel-soft p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Recent Enrolments</p>
                    <div className="mt-3 grid gap-2">
                        {isLoading ? <p className="text-sm text-[var(--muted)]">Loading records...</p> : null}
                        {!isLoading && records.length === 0 ? <p className="text-sm text-[var(--muted)]">No enrolment records yet.</p> : null}
                        {records.slice(0, 8).map((record) => (
                            <article key={record.id} className="rounded-md border border-[var(--line)] bg-white p-3">
                                <p className="text-sm font-medium">{record.external_reference} / {record.modality}</p>
                                <p className="mono text-xs text-[var(--muted)]">quality={record.template_quality ?? "n/a"} status={record.status}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
