const { createHttpError } = require("../utils/http");

function getBiometricEngineBaseUrl() {
    return process.env.BIOMETRIC_ENGINE_URL || "http://127.0.0.1:8000";
}

function toPositiveInteger(value, defaultValue) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return defaultValue;
    }
    return Math.trunc(parsed);
}

function getBiometricEngineTimeoutMs() {
    return toPositiveInteger(process.env.BIOMETRIC_ENGINE_TIMEOUT_MS, 4500);
}

function getBiometricEngineRetryCount() {
    return toPositiveInteger(process.env.BIOMETRIC_ENGINE_RETRY_COUNT, 1);
}

function getBiometricEngineRetryDelayMs() {
    return toPositiveInteger(process.env.BIOMETRIC_ENGINE_RETRY_DELAY_MS, 250);
}

function buildEngineUrl(path) {
    const baseUrl = getBiometricEngineBaseUrl().replace(/\/$/, "");
    return `${baseUrl}${path}`;
}

function isRetriableStatusCode(statusCode) {
    return statusCode === 408 || statusCode === 429 || statusCode >= 500;
}

function wait(durationMs) {
    return new Promise((resolve) => {
        setTimeout(resolve, durationMs);
    });
}

async function requestBiometricEngine(method, path, payload = undefined) {
    if (typeof fetch !== "function") {
        throw createHttpError(503, "Global fetch is not available in this runtime.");
    }

    const retries = getBiometricEngineRetryCount();
    const timeoutMs = getBiometricEngineTimeoutMs();
    const retryDelayMs = getBiometricEngineRetryDelayMs();
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, timeoutMs);

        try {
            const response = await fetch(buildEngineUrl(path), {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: payload === undefined ? undefined : JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeout);
            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const error = createHttpError(
                    response.status,
                    body.detail || body.error || "Biometric engine request failed."
                );

                if (attempt < retries && isRetriableStatusCode(response.status)) {
                    await wait(retryDelayMs * (attempt + 1));
                    continue;
                }

                throw error;
            }

            return body;
        } catch (error) {
            clearTimeout(timeout);
            const aborted = error && error.name === "AbortError";
            lastError = aborted
                ? createHttpError(504, `Biometric engine request timed out after ${timeoutMs}ms.`)
                : error;

            if (attempt < retries) {
                await wait(retryDelayMs * (attempt + 1));
                continue;
            }

            throw lastError;
        }
    }

    throw lastError || createHttpError(503, "Biometric engine request failed.");
}

async function postBiometricEngine(path, payload) {
    return requestBiometricEngine("POST", path, payload);
}

async function getBiometricEngine(path) {
    return requestBiometricEngine("GET", path);
}

async function evaluateQuality(sample) {
    return postBiometricEngine("/biometrics/quality", sample);
}

async function extractBiometrics(request) {
    return postBiometricEngine("/biometrics/extract", request);
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
    extractBiometrics,
    fuseBiometrics,
    evaluateBiometrics,
    verifyBiometrics,
    identifyBiometrics,
    getBiometricPolicy
};
