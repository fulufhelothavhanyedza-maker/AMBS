const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: Record<string, string>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        cache: "no-store",
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`API request failed (${response.status}): ${detail || response.statusText}`);
    }

    return (await response.json()) as T;
}

export type ReportsAnalytics = {
    byStatus: Array<{ status: string; count: number }>;
    byRisk: Array<{ riskLevel: string; count: number }>;
    byModality: Array<{ modality: string; count: number }>;
    byDecision: Array<{ decision: string; count: number }>;
};

export type Modality = "face" | "gait" | "fingerprint" | "voice" | "iris";

export type EnrolmentSubject = {
    id: string;
    external_reference: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    status: string;
    created_at: string;
};

export type EnrolmentRecord = {
    id: string;
    subject_id: string;
    external_reference: string;
    first_name: string;
    last_name: string;
    modality: Modality;
    template_reference: string;
    template_quality: number | null;
    status: string;
    enrolled_at: string;
};

export type BiometricTemplate = {
    id: string;
    subject_id: string;
    external_reference: string;
    first_name: string;
    last_name: string;
    modality: Modality;
    template_reference: string;
    feature_vector: unknown;
    vector_dimension: number;
    template_quality: number | null;
    status: string;
    version: number;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
};

export type BiometricPolicySummary = {
    policy: string;
    defaultThreshold: number;
    minThreshold: number;
    maxThreshold: number;
    riskMultiplier: number;
    qualityPenalty: number;
    environmentMultiplier: number;
};

export type VerifyRequest = {
    probeSamples: Array<{ modality: Modality; embedding: number[] }>;
    referenceSamples: Array<{ modality: Modality; embedding: number[] }>;
    policy?: string;
    riskScore?: number;
    environmentQuality?: number;
};

export type VerifyResponse = {
    subject_id: string | null;
    policy: string;
    fused_score: number;
    adjusted_threshold: number;
    decision: string;
    evidence: Array<{
        modality: string;
        probe_quality: number;
        reference_quality: number;
        similarity: number;
        weight: number;
    }>;
    factors: Record<string, unknown>;
};

export type IdentifyRequest = {
    probeSamples: Array<{ modality: Modality; embedding: number[] }>;
    candidates: Array<{
        subject_id: string;
        reference_samples: Array<{ modality: Modality; embedding: number[] }>;
    }>;
    policy?: string;
    topK?: number;
    riskScore?: number;
    environmentQuality?: number;
};

export type IdentifyResponse = {
    matches: Array<{
        subject_id: string;
        score: number;
        adjusted_threshold: number;
        decision: string;
        rank: number;
    }>;
    top_match: {
        subject_id: string;
        score: number;
        adjusted_threshold: number;
        decision: string;
        rank: number;
    } | null;
};

export const api = {
    getReportsAnalytics() {
        return request<ReportsAnalytics>("/api/reports/analytics");
    },

    getDefaultBiometricPolicy() {
        return request<BiometricPolicySummary>("/api/engines/biometrics/policies/default");
    },

    verifyBiometric(payload: VerifyRequest) {
        return request<VerifyResponse>("/api/engines/biometrics/verify", {
            method: "POST",
            body: payload,
        });
    },

    identifyBiometric(payload: IdentifyRequest) {
        return request<IdentifyResponse>("/api/engines/biometrics/identify", {
            method: "POST",
            body: payload,
        });
    },

    getEnrolmentSubjects() {
        return request<{ subjects: EnrolmentSubject[] }>("/api/enrolment/subjects");
    },

    createEnrolmentSubject(payload: {
        externalReference: string;
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
    }) {
        return request<{ subject: EnrolmentSubject }>("/api/enrolment/subjects", {
            method: "POST",
            body: payload,
        });
    },

    getEnrolmentRecords() {
        return request<{ enrolments: EnrolmentRecord[] }>("/api/enrolment/records");
    },

    createEnrolmentRecord(payload: {
        subjectId: string;
        modality: Modality;
        templateReference: string;
        templateQuality?: number;
        featureVector?: number[];
        metadata?: Record<string, unknown>;
    }) {
        return request<{ enrolment: EnrolmentRecord; biometricTemplate: BiometricTemplate }>("/api/enrolment/records", {
            method: "POST",
            body: payload,
        });
    },

    getBiometricTemplates() {
        return request<{ templates: BiometricTemplate[] }>("/api/enrolment/templates");
    },

    revokeBiometricTemplate(templateId: string) {
        return request<{ template: BiometricTemplate }>(`/api/enrolment/templates/${templateId}`, {
            method: "DELETE",
        });
    },
};
