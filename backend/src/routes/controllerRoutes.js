const express = require("express");

const { requireAuth } = require("../middleware/auth");
const { createHttpError, asyncHandler } = require("../utils/http");
const { dispatchLocalControllerCommand, getLocalControllerDeviceState, listLocalControllerEvents } = require("../services/localControllerService");

const router = express.Router();

function requireControllerWebhookAuth(request, response, next) {
    const expectedToken = process.env.ACCESS_CONTROLLER_WEBHOOK_TOKEN;

    if (!expectedToken) {
        if (process.env.NODE_ENV === "production") {
            return next(createHttpError(500, "ACCESS_CONTROLLER_WEBHOOK_TOKEN must be configured in production."));
        }
        return next();
    }

    const header = request.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return next(createHttpError(401, "Missing controller bearer token."));
    }

    const token = header.slice("Bearer ".length);
    if (token !== expectedToken) {
        return next(createHttpError(403, "Invalid controller bearer token."));
    }

    return next();
}

router.post(
    "/dispatch",
    requireControllerWebhookAuth,
    asyncHandler(async (request, response) => {
        const { targetResource, outcome, command, accessPoint = null } = request.body;

        if (!targetResource || !outcome || !command) {
            throw createHttpError(400, "targetResource, outcome, and command are required.");
        }

        response.json(await dispatchLocalControllerCommand({
            targetResource,
            outcome,
            accessPoint,
            command
        }));
    })
);

router.get(
    "/devices/:targetResource/status",
    requireAuth,
    asyncHandler(async (request, response) => {
        const { targetResource } = request.params;
        const deviceState = await getLocalControllerDeviceState(targetResource);

        if (!deviceState) {
            throw createHttpError(404, "Controller device state not found.");
        }

        response.json({ deviceState });
    })
);

router.get(
    "/events",
    requireAuth,
    asyncHandler(async (request, response) => {
        const limit = Number.parseInt(String(request.query.limit || "100"), 10);
        response.json({ events: await listLocalControllerEvents(Number.isFinite(limit) ? limit : 100) });
    })
);

module.exports = router;