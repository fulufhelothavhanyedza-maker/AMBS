const crypto = require("node:crypto");

const { query } = require("../config/database");
const { loadHardwareControllerAdapter, getHardwareControllerAdapterConfig } = require("./hardwareControllerAdapter");

const controllerDeviceState = new Map();

function nextControllerEventId() {
    if (typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `evt-${Date.now()}`;
}

async function persistControllerDispatchEvent(deviceState, command, accessPoint) {
    const persistedCommand = {
        ...command,
        adapter: deviceState.adapter,
        telemetry: deviceState.telemetry
    };

    const eventResult = await query(
        `
      INSERT INTO controller_dispatch_events (
        id,
        target_resource,
        outcome,
        controller_response,
        access_point,
        command_payload,
        device_state,
        metadata,
        delivered_at
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8::jsonb, $9)
      RETURNING id
    `,
        [
            deviceState.lastEventId,
            deviceState.targetResource,
            deviceState.outcome,
            command.status === "opened"
                ? "delivered"
                : command.queue === "security_desk"
                    ? "queued"
                    : "locked",
            JSON.stringify(accessPoint),
            JSON.stringify(command),
            deviceState.state,
            JSON.stringify({ provider: "local_controller", adapter: deviceState.adapter }),
            deviceState.updatedAt
        ]
    );

    await query(
        `
      INSERT INTO controller_device_state (
        target_resource,
        access_point,
        outcome,
        state,
        last_command,
        last_event_id
      )
      VALUES ($1, $2::jsonb, $3, $4, $5::jsonb, $6)
      ON CONFLICT (target_resource)
      DO UPDATE SET
        access_point = EXCLUDED.access_point,
        outcome = EXCLUDED.outcome,
        state = EXCLUDED.state,
        last_command = EXCLUDED.last_command,
        last_event_id = EXCLUDED.last_event_id
    `,
        [
            deviceState.targetResource,
            JSON.stringify(accessPoint),
            deviceState.outcome,
            deviceState.state,
            JSON.stringify(persistedCommand),
            eventResult.rows[0].id
        ]
    );
}

async function dispatchLocalControllerCommand({ targetResource, outcome, accessPoint, command }) {
    const adapterName = process.env.ACCESS_CONTROLLER_ADAPTER || "local_simulated_relay";
    const adapter = loadHardwareControllerAdapter(adapterName);
    const adapterConfig = getHardwareControllerAdapterConfig(adapterName);
    const adapterResult = await adapter.executeCommand(command, {
        targetResource,
        outcome,
        accessPoint,
        adapterConfig
    });
    const controllerEventId = nextControllerEventId();
    const now = new Date().toISOString();
    const deviceState = {
        targetResource,
        accessPoint,
        outcome,
        state: adapterResult.deviceState,
        adapter: adapter.adapterName || adapterResult.adapter || adapterName,
        lastCommand: {
            ...command,
            adapter: adapter.adapterName || adapterResult.adapter || adapterName,
            telemetry: adapterResult.telemetry || {}
        },
        lastEventId: controllerEventId,
        updatedAt: now,
        telemetry: adapterResult.telemetry || {}
    };

    controllerDeviceState.set(targetResource, deviceState);

    try {
        await persistControllerDispatchEvent(deviceState, command, accessPoint);
    } catch {
        // Fall back to in-memory state if the database is unavailable.
    }

    return {
        controllerResponse: command.status === "opened"
            ? "delivered"
            : command.queue === "security_desk"
                ? "queued"
                : "locked",
        controllerEventId,
        deliveredAt: now,
        deviceState,
        adapter: deviceState.adapter,
        adapterResponse: adapterResult
    };
}

async function getLocalControllerDeviceState(targetResource) {
    try {
        const result = await query(
            `
        SELECT
          target_resource,
          access_point,
          outcome,
          state,
          last_event_id,
          last_command,
          updated_at
        FROM controller_device_state
        WHERE target_resource = $1
      `,
            [targetResource]
        );

        if (result.rowCount > 0) {
            const row = result.rows[0];
            return {
                targetResource: row.target_resource,
                accessPoint: row.access_point,
                outcome: row.outcome,
                state: row.state,
                adapter: row.last_command?.adapter || null,
                lastCommand: row.last_command,
                lastEventId: row.last_event_id,
                updatedAt: row.updated_at
            };
        }
    } catch {
        // Fall through to in-memory state.
    }

    return controllerDeviceState.get(targetResource) || null;
}

async function listLocalControllerEvents(limit = 100) {
    try {
        const result = await query(
            `
        SELECT
          id,
          target_resource,
          outcome,
          controller_response,
          access_point,
          command_payload,
          device_state,
          metadata,
          delivered_at
        FROM controller_dispatch_events
        ORDER BY delivered_at DESC
        LIMIT $1
      `,
            [limit]
        );

        return result.rows.map((row) => ({
            id: row.id,
            targetResource: row.target_resource,
            outcome: row.outcome,
            controllerResponse: row.controller_response,
            accessPoint: row.access_point,
            commandPayload: row.command_payload,
            deviceState: row.device_state,
            metadata: row.metadata,
            deliveredAt: row.delivered_at
        }));
    } catch {
        return [...controllerDeviceState.values()].map((deviceState) => ({
            id: deviceState.lastEventId,
            targetResource: deviceState.targetResource,
            outcome: deviceState.outcome,
            controllerResponse: deviceState.state === "open" ? "delivered" : deviceState.state === "review" ? "queued" : "locked",
            accessPoint: deviceState.accessPoint,
            commandPayload: deviceState.lastCommand,
            deviceState: deviceState.state,
            metadata: { provider: "memory_fallback", adapter: deviceState.adapter || "local_simulated_relay" },
            deliveredAt: deviceState.updatedAt
        }));
    }
}

async function listLocalControllerDeviceStates(limit = 100) {
    try {
        const result = await query(
            `
        SELECT
          target_resource,
          access_point,
          outcome,
          state,
          last_command,
          last_event_id,
          updated_at
        FROM controller_device_state
        ORDER BY updated_at DESC
        LIMIT $1
      `,
            [limit]
        );

        return result.rows.map((row) => ({
            targetResource: row.target_resource,
            accessPoint: row.access_point,
            outcome: row.outcome,
            state: row.state,
            adapter: row.last_command?.adapter || null,
            lastCommand: row.last_command,
            lastEventId: row.last_event_id,
            updatedAt: row.updated_at
        }));
    } catch {
        return [...controllerDeviceState.values()]
            .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)))
            .slice(0, limit);
    }
}

module.exports = {
    dispatchLocalControllerCommand,
    getLocalControllerDeviceState,
    listLocalControllerEvents,
    listLocalControllerDeviceStates
};