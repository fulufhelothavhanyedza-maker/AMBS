const { query } = require("../config/database");

function parseTimeToMinutes(value) {
    const [hours = "0", minutes = "0"] = String(value).split(":");
    return Number(hours) * 60 + Number(minutes);
}

function isWithinWindow(currentMinutes, startMinutes, endMinutes) {
    if (startMinutes === endMinutes) {
        return true;
    }

    if (startMinutes < endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }

    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}

async function resolveAccessPoint({ accessPointId, targetResource }) {
    if (accessPointId) {
        const result = await query(
            `
        SELECT id, name, location, security_level, status
        FROM access_points
        WHERE id = $1
      `,
            [accessPointId]
        );

        return result.rows[0] || null;
    }

    if (!targetResource) {
        return null;
    }

    const result = await query(
        `
      SELECT id, name, location, security_level, status
      FROM access_points
      WHERE name = $1
    `,
        [targetResource]
    );

    return result.rows[0] || null;
}

async function evaluateAccessPolicy({ accessPoint, riskLevel, now = new Date() }) {
    if (!accessPoint) {
        return {
            accessPoint: null,
            matchedPolicy: null,
            isAllowed: true,
            stepUpRequired: false,
            reason: "no_access_point_context"
        };
    }

    const policyResult = await query(
        `
      SELECT id, access_point_id, permitted_start_time, permitted_end_time, risk_level, step_up_required
      FROM access_policies
      WHERE access_point_id = $1
      ORDER BY created_at DESC
    `,
        [accessPoint.id]
    );

    if (policyResult.rows.length === 0) {
        return {
            accessPoint,
            matchedPolicy: null,
            isAllowed: true,
            stepUpRequired: false,
            reason: "no_policy_defined"
        };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const normalizedRiskLevel = String(riskLevel || "").toLowerCase();
    const riskPolicies = policyResult.rows.filter((policy) => policy.risk_level.toLowerCase() === normalizedRiskLevel);

    const matchedPolicy = riskPolicies.find((policy) => {
        return isWithinWindow(
            currentMinutes,
            parseTimeToMinutes(policy.permitted_start_time),
            parseTimeToMinutes(policy.permitted_end_time)
        );
    });

    if (matchedPolicy) {
        return {
            accessPoint,
            matchedPolicy,
            isAllowed: true,
            stepUpRequired: matchedPolicy.step_up_required,
            reason: matchedPolicy.step_up_required ? "step_up_required" : "policy_matched"
        };
    }

    if (riskPolicies.length > 0) {
        return {
            accessPoint,
            matchedPolicy: null,
            isAllowed: false,
            stepUpRequired: riskPolicies.some((policy) => policy.step_up_required),
            reason: "outside_permitted_window"
        };
    }

    return {
        accessPoint,
        matchedPolicy: null,
        isAllowed: false,
        stepUpRequired: false,
        reason: "risk_level_not_permitted"
    };
}

module.exports = {
    resolveAccessPoint,
    evaluateAccessPolicy
};
