const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.PORT = process.env.PORT || "0";
process.env.BIOMETRIC_ENGINE_URL = process.env.BIOMETRIC_ENGINE_URL || "http://biometric-engine.local:8000";

const database = require("../backend/src/config/database");

const originalQuery = database.query;

let insertState;

database.query = async (text, params) => {
    if (text.includes("FROM app_users") && text.includes("WHERE id = $1")) {
        return {
            rowCount: 1,
            rows: [{ id: params[0], username: "admin", full_name: "Admin User", role: "administrator", status: "active" }]
        };
    }

    if (text.includes("INSERT INTO enrolments")) {
        insertState.enrolmentReference = params[2];
        return {
            rowCount: 1,
            rows: [{
                id: "enrolment-1",
                subject_id: params[0],
                modality: params[1],
                template_reference: params[2],
                template_quality: params[3],
                status: "enrolled",
                enrolled_at: new Date().toISOString()
            }]
        };
    }

    if (text.includes("INSERT INTO biometric_templates")) {
        insertState.templateReference = params[2];
        insertState.featureVector = JSON.parse(params[3]);
        insertState.templateMetadata = JSON.parse(params[9]);
        return {
            rowCount: 1,
            rows: [{
                id: "template-1",
                subject_id: params[0],
                modality: params[1],
                template_reference: params[2],
                feature_vector: JSON.parse(params[3]),
                vector_dimension: params[4],
                template_quality: params[5],
                status: params[6],
                version: params[7],
                metadata: JSON.parse(params[9])
            }]
        };
    }

    if (text.includes("INSERT INTO audit_logs")) {
        return { rowCount: 1, rows: [] };
    }

    return { rowCount: 0, rows: [] };
};

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
    await new Promise((resolve) => server.close(resolve));
    await shutdown();
});

test("enrolment route extracts embeddings from capture samples before storing a template", async () => {
    insertState = {};
    const originalFetch = global.fetch;

    global.fetch = async (url, options) => {
        if (String(url).startsWith(baseUrl)) {
            return originalFetch(url, options);
        }

        assert.equal(url, "http://biometric-engine.local:8000/biometrics/extract");
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
                        quality_context: { lighting: 0.95, occlusion: 0.05, motion_blur: 0.02, noise: 0.03, risk_level: 0 },
                        diagnostics: { frame_count: 18, capture_duration: 1.2 }
                    }
                ]
            })
        };
    };

    try {
        const response = await fetch(`${baseUrl}/api/enrolment/records`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                subjectId: "subject-1",
                modality: "face",
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
                metadata: { source: "capture" }
            })
        });

        const payload = await response.json();

        assert.equal(response.status, 201);
        assert.equal(insertState.templateReference, insertState.enrolmentReference);
        assert.deepEqual(insertState.featureVector, [0.62, 0.48, 0.54, 0.59, 0.94, 0.6, 0.95, 0.95]);
        assert.equal(insertState.templateMetadata.createdFromCapture, true);
        assert.deepEqual(insertState.templateMetadata.extractionDiagnostics, { frame_count: 18, capture_duration: 1.2 });
        assert.equal(payload.extraction.samples[0].modality, "face");
        assert.deepEqual(payload.biometricTemplate.feature_vector, [0.62, 0.48, 0.54, 0.59, 0.94, 0.6, 0.95, 0.95]);
    } finally {
        global.fetch = originalFetch;
    }
});