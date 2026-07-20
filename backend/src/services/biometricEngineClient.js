const { createHttpError } = require("../utils/http");

function getBiometricEngineBaseUrl() {
    return process.env.BIOMETRIC_ENGINE_URL || "http://127.0.0.1:8000";
}

function buildEngineUrl(path) {
    const baseUrl = getBiometricEngineBaseUrl().replace(/\/$/, "");
    return `${baseUrl}${path}`;
}

async function postBiometricEngine(path, payload) {
    if (typeof fetch !== "function") {
        throw createHttpError(503, "Global fetch is not available in this runtime.");
    }

    const response = await fetch(buildEngineUrl(path), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw createHttpError(
            response.status,
            body.detail || body.error || "Biometric engine request failed."
        );
    }

    return body;
}

async function getBiometricEngine(path) {
    if (typeof fetch !== "function") {
        throw createHttpError(503, "Global fetch is not available in this runtime.");
    }

    const response = await fetch(buildEngineUrl(path), {
        method: "GET",
        headers: {
            Accept: "application/json"
        }
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw createHttpError(
            response.status,
            body.detail || body.error || "Biometric engine request failed."
        );
    }

    return body;
}

async function evaluateQuality(sample) {
    return postBiometricEngine("/biometrics/quality", sample);
}

async function fuseBiometrics(request) {
    return postBiometricEngine("/biometrics/fuse", request);
}

async function evaluateBiometrics(request) {
    return postBiometricEngine("/biometrics/evaluate", request);
}

async function verifyBiometrics(request) {
    return postBiometricEngine("/biometrics/verify", request);
}

async function identifyBiometrics(request) {
    return postBiometricEngine("/biometrics/identify", request);
}

async function getBiometricPolicy() {
    return getBiometricEngine("/biometrics/policies/default");
}

module.exports = {
    getBiometricEngineBaseUrl,
    evaluateQuality,
    fuseBiometrics,
    evaluateBiometrics,
    verifyBiometrics,
    identifyBiometrics,
    getBiometricPolicy
};
