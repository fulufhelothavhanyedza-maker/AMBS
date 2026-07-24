const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.PORT = process.env.PORT || "0";
process.env.BIOMETRIC_ENGINE_URL = process.env.BIOMETRIC_ENGINE_URL || "http://biometric-engine.local:8000";

const database = require("../backend/src/config/database");

const originalQuery = database.query;
const originalGetClient = database.getClient;

let insertState;

database.query = async (text, params) => {
    if (text.includes("FROM app_users") && text.includes("WHERE id = $1")) {
        return {
            rowCount: 1,
            rows: [{ id: params[0], username: "admin", full_name: "Admin User", role: "administrator", status: "active" }]
        };
    }

    if (text.includes("COUNT(*)::int AS count") && text.includes("FROM authentication_attempts")) {
        return { rowCount: 1, rows: [{ count: 0 }] };
    }

    if (text.includes("FROM access_points")) {
        return {
            rowCount: 1,
            rows: [{ id: "ap-1", name: params[0] || "entry_gate_a", location: "Residence A", security_level: "low", status: "active" }]
        };
    }

    if (text.includes("FROM access_policies")) {
        return { rowCount: 0, rows: [] };
    }

    if (text.includes("FROM biometric_templates t")) {
        return { rowCount: 0, rows: [] };
    }

    if (text.includes("INSERT INTO audit_logs")) {
        return { rowCount: 1, rows: [] };
    }

    if (text.includes("INSERT INTO monitoring_events")) {
        return { rowCount: 1, rows: [{ id: 1 }] };
    }

    return { rowCount: 0, rows: [] };
};

database.getClient = async () => ({
    query: async (text, params) => {
        if (text === "BEGIN" || text === "COMMIT" || text === "ROLLBACK") {
            return { rowCount: 0, rows: [] };
        }

        if (text.includes("INSERT INTO authentication_attempts")) {
            insertState.attemptStatus = params[3];
            return {
                rowCount: 1,
                rows: [{
                    id: "attempt-capture-1",
                    subject_id: params[0],
                    primary_modality: params[2],
                    status: params[3],
                    confidence_score: params[4],
                    risk_score: params[5],
                    source_channel: params[6],
                    started_at: new Date().toISOString(),
                    completed_at: new Date().toISOString()
                }]
            };
        }

        if (text.includes("INSERT INTO risk_assessments")) {
            return {
                rowCount: 1,
                rows: [{ id: "risk-capture-1", risk_score: params[1], risk_level: params[2], factors: JSON.parse(params[3]), evaluated_at: new Date().toISOString() }]
            };
        }

        if (text.includes("INSERT INTO fusion_results")) {
            insertState.fusedScore = params[2];
            insertState.algorithmVersion = params[3];
            return {
                rowCount: 1,
                rows: [{ id: "fusion-capture-1", participating_modalities: params[1], fused_score: params[2], algorithm_version: params[3], evidence: JSON.parse(params[4]) }]
            };
        }

        if (text.includes("INSERT INTO decisions")) {
            insertState.decisionOutcome = params[3];
            insertState.rationale = JSON.parse(params[4]);
            return {
                rowCount: 1,
                rows: [{ id: "decision-capture-1", outcome: params[3], rationale: JSON.parse(params[4]), created_at: new Date().toISOString() }]
            };
        }

        if (text.includes("INSERT INTO access_controller_events")) {
            return {
                rowCount: 1,
                rows: [{ id: "controller-capture-1", decision_id: params[0], target_resource: params[1], controller_response: params[2], delivered_at: new Date().toISOString(), response_payload: JSON.parse(params[3]) }]
            };
        }

        return { rowCount: 0, rows: [] };
    },
    release: () => { }
});

const { app, shutdown } = require("../backend/src/app");

let server;
let baseUrl;
const token = jwt.sign(
    { sub: "user-1", username: "admin", role: "administrator" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
);

test.before(async () => {
    await shutdown();
    server = app.listen(0);
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
    database.query = originalQuery;
    database.getClient = originalGetClient;
    await new Promise((resolve) => server.close(resolve));
    await shutdown();
});

test("authentication route extracts embeddings from capture samples before biometric evaluation", async () => {
    insertState = {};
    const originalFetch = global.fetch;
    const calls = [];

    global.fetch = async (url, options) => {
        if (String(url).startsWith(baseUrl)) {
            return originalFetch(url, options);
        }

        calls.push({ url, options });

        if (url === "http://biometric-engine.local:8000/biometrics/extract") {
            const payload = JSON.parse(options.body);
            assert.equal(payload.samples[0].modality, "face");
            assert.deepEqual(payload.samples[0].raw_signal, [0.2, 0.4, 0.6, 0.5, 0.45]);

            return {
                ok: true,
                status: 200,
                json: async () => ({
                    samples: [
                        {
                            modality: "face",
                            embedding: [0.62, 0.48, 0.54, 0.59, 0.94, 0.6, 0.95, 0.95],
                            quality_context: { lighting: 0.95, occlusion: 0.05, motion_blur: 0.02, noise: 0.03, risk_level: 0, liveness_confidence: 0.94, spoof_risk: 0.04 },
                            diagnostics: { frame_count: 18 }
                        }
                    ]
                })
            };
        }

        assert.equal(url, "http://biometric-engine.local:8000/biometrics/evaluate");
        const payload = JSON.parse(options.body);
        assert.deepEqual(payload.samples[0].embedding, [0.62, 0.48, 0.54, 0.59, 0.94, 0.6, 0.95, 0.95]);

        return {
            ok: true,
            status: 200,
            json: async () => ({
                quality: [{ modality: "face", quality_score: 91 }],
                fusion: {
                    fused_score: 0.9,
                    adjusted_threshold: 0.75,
                    decision: "accept",
                    evidence: [{ modality: "face", quality_score: 91, normalized_score: 0.9, weight: 1 }],
                    factors: { average_quality: 91 }
                }
            })
        };
    };

    try {
        const response = await fetch(`${baseUrl}/api/authentication/attempts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                subjectId: "subject-1",
                primaryModality: "face",
                confidenceScore: 85,
                sourceChannel: "internal_portal",
                targetResource: "entry_gate_a",
                modalityScores: { face: 10, gait: 5 },
                biometricEvaluationRequest: {
                    captureSamples: [
                        {
                            modality: "face",
                            raw_signal: [0.2, 0.4, 0.6, 0.5, 0.45],
                            frame_count: 18,
                            capture_duration: 1.2,
                            sensor_confidence: 0.94,
                            quality_context: { lighting: 0.95, occlusion: 0.05, motion_blur: 0.02, noise: 0.03, risk_level: 0 }
                        }
                    ],
                    strategy: "score_level",
                    baseThreshold: 0.75,
                    adaptationWindow: 3
                }
            })
        });

        const payload = await response.json();

        assert.equal(response.status, 201);
        assert.equal(calls.length, 2);
        assert.equal(calls[0].url, "http://biometric-engine.local:8000/biometrics/extract");
        assert.equal(calls[1].url, "http://biometric-engine.local:8000/biometrics/evaluate");
        assert.equal(insertState.algorithmVersion, "biometric-engine-adaptive-fusion-v1");
        assert.equal(insertState.decisionOutcome, "allow");
        assert.equal(insertState.rationale.extractionSource, "biometric_engine_extract");
        assert.equal(insertState.rationale.spoofRisk, 0.04);
        assert.equal(insertState.rationale.livenessConfidence, 0.94);
        assert.equal(payload.biometricExtraction.samples[0].modality, "face");
        assert.equal(payload.biometricEvaluation.fusion.decision, "accept");
    } finally {
        global.fetch = originalFetch;
    }
});