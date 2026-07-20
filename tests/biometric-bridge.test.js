const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const http = require("node:http");

process.env.BIOMETRIC_ENGINE_URL = process.env.BIOMETRIC_ENGINE_URL || "http://biometric-engine.local:8000";

const engineRoutes = require("../backend/src/routes/engineRoutes");
const biometricClient = require("../backend/src/services/biometricEngineClient");

function createResponse(payload, ok = true, status = 200) {
    return {
        ok,
        status,
        json: async () => payload
    };
}

function postJson(url, payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        const request = http.request(
            url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body)
                }
            },
            (response) => {
                let raw = "";
                response.setEncoding("utf8");
                response.on("data", (chunk) => {
                    raw += chunk;
                });
                response.on("end", () => {
                    resolve({ statusCode: response.statusCode, body: raw ? JSON.parse(raw) : {} });
                });
            }
        );

        request.on("error", reject);
        request.write(body);
        request.end();
    });
}

test("biometric client posts to the FastAPI quality endpoint", async () => {
    const originalFetch = global.fetch;
    const calls = [];

    global.fetch = async (url, options) => {
        calls.push({ url, options });
        return createResponse({ modality: "face", quality_score: 88, recommendation: "use_primary" });
    };

    try {
        const payload = await biometricClient.evaluateQuality({ modality: "face", embedding: [0.9, 0.8, 0.7] });

        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "http://biometric-engine.local:8000/biometrics/quality");
        assert.equal(calls[0].options.method, "POST");
        assert.equal(payload.quality_score, 88);
    } finally {
        global.fetch = originalFetch;
    }
});

test("engine router proxies biometric evaluate requests", async () => {
    const originalFetch = global.fetch;
    const calls = [];

    global.fetch = async (url, options) => {
        calls.push({ url, options });
        return createResponse({
            quality: [{ modality: "face", quality_score: 91 }],
            fusion: { fused_score: 0.92, adjusted_threshold: 0.75, decision: "accept" }
        });
    };

    const app = express();
    app.use(express.json());
    app.use("/api/engines", engineRoutes);

    const server = app.listen(0);

    try {
        const address = server.address();
        const result = await postJson(`http://127.0.0.1:${address.port}/api/engines/biometrics/evaluate`, {
            samples: [
                {
                    modality: "face",
                    embedding: [0.9, 0.8, 0.7],
                    quality_context: { lighting: 0.9, occlusion: 0.0, motion_blur: 0.0, noise: 0.0, risk_level: 0.0 }
                }
            ]
        });

        assert.equal(result.statusCode, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "http://biometric-engine.local:8000/biometrics/evaluate");
        assert.equal(result.body.fusion.decision, "accept");
    } finally {
        global.fetch = originalFetch;
        await new Promise((resolve) => server.close(resolve));
    }
});

test("biometric client fetches the default policy profile", async () => {
    const originalFetch = global.fetch;
    const calls = [];

    global.fetch = async (url, options) => {
        calls.push({ url, options });
        return createResponse({
            policy: "score_level",
            threshold_bias: 0,
            base_weights: { face: 1 }
        });
    };

    try {
        const payload = await biometricClient.getBiometricPolicy();

        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "http://biometric-engine.local:8000/biometrics/policies/default");
        assert.equal(calls[0].options.method, "GET");
        assert.equal(payload.policy, "score_level");
    } finally {
        global.fetch = originalFetch;
    }
});

test("engine router proxies biometric verify requests", async () => {
    const originalFetch = global.fetch;
    const calls = [];

    global.fetch = async (url, options) => {
        calls.push({ url, options });
        return createResponse({
            subject_id: "subject-1",
            policy: "score_level",
            fused_score: 0.91,
            adjusted_threshold: 0.75,
            decision: "accept",
            evidence: []
        });
    };

    const app = express();
    app.use(express.json());
    app.use("/api/engines", engineRoutes);

    const server = app.listen(0);

    try {
        const address = server.address();
        const result = await postJson(`http://127.0.0.1:${address.port}/api/engines/biometrics/verify`, {
            probeSamples: [
                {
                    modality: "face",
                    embedding: [0.9, 0.8, 0.7],
                    quality_context: { lighting: 0.9, occlusion: 0.0, motion_blur: 0.0, noise: 0.0, risk_level: 0.0 }
                }
            ],
            referenceSamples: [
                {
                    modality: "face",
                    embedding: [0.91, 0.81, 0.71],
                    quality_context: { lighting: 0.95, occlusion: 0.0, motion_blur: 0.0, noise: 0.0, risk_level: 0.0 }
                }
            ]
        });

        assert.equal(result.statusCode, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "http://biometric-engine.local:8000/biometrics/verify");
        assert.equal(result.body.decision, "accept");
    } finally {
        global.fetch = originalFetch;
        await new Promise((resolve) => server.close(resolve));
    }
});

test("engine router proxies biometric identify requests", async () => {
    const originalFetch = global.fetch;
    const calls = [];

    global.fetch = async (url, options) => {
        calls.push({ url, options });
        return createResponse({
            matches: [
                { subject_id: "candidate-1", score: 0.93, adjusted_threshold: 0.75, decision: "match", evidence: [], rank: 1 }
            ],
            top_match: { subject_id: "candidate-1", score: 0.93, adjusted_threshold: 0.75, decision: "match", evidence: [], rank: 1 }
        });
    };

    const app = express();
    app.use(express.json());
    app.use("/api/engines", engineRoutes);

    const server = app.listen(0);

    try {
        const address = server.address();
        const result = await postJson(`http://127.0.0.1:${address.port}/api/engines/biometrics/identify`, {
            probeSamples: [
                {
                    modality: "gait",
                    embedding: [0.91, 0.9, 0.89],
                    quality_context: { lighting: 0.92, occlusion: 0.0, motion_blur: 0.0, noise: 0.0, risk_level: 0.0 }
                }
            ],
            candidates: [
                {
                    subject_id: "candidate-1",
                    reference_samples: [
                        {
                            modality: "gait",
                            embedding: [0.9, 0.89, 0.88],
                            quality_context: { lighting: 0.94, occlusion: 0.0, motion_blur: 0.0, noise: 0.0, risk_level: 0.0 }
                        }
                    ]
                }
            ]
        });

        assert.equal(result.statusCode, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "http://biometric-engine.local:8000/biometrics/identify");
        assert.equal(result.body.top_match.subject_id, "candidate-1");
    } finally {
        global.fetch = originalFetch;
        await new Promise((resolve) => server.close(resolve));
    }
});
