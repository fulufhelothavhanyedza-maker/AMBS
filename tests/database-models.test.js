const test = require("node:test");
const assert = require("node:assert/strict");

const database = require("../backend/src/config/database");
const { createUser, listUsers } = require("../backend/src/models/userModel");
const {
    calculateVectorDimension,
    createBiometricTemplate,
    revokeBiometricTemplate,
    listBiometricTemplates
} = require("../backend/src/models/biometricTemplateModel");
const { writeAuditLog, listAuditLogs } = require("../backend/src/models/auditLogModel");

const originalQuery = database.query;

test.afterEach(() => {
    database.query = originalQuery;
});

test("createUser returns the inserted user record", async () => {
    let captured;
    database.query = async (text, params) => {
        captured = { text, params };
        return {
            rowCount: 1,
            rows: [
                {
                    id: "user-1",
                    username: params[0],
                    full_name: params[2],
                    email: params[3],
                    role: params[4],
                    status: "active"
                }
            ]
        };
    };

    const user = await createUser({
        username: "jane.doe",
        passwordHash: "hashed-password",
        fullName: "Jane Doe",
        email: "jane@example.com",
        role: "auditor"
    });

    assert.ok(captured.text.includes("INSERT INTO app_users"));
    assert.equal(user.username, "jane.doe");
    assert.equal(user.role, "auditor");
});

test("listUsers returns rows from the database", async () => {
    database.query = async () => ({
        rows: [{ id: "user-1", username: "admin" }]
    });

    const users = await listUsers();
    assert.equal(users.length, 1);
    assert.equal(users[0].username, "admin");
});

test("biometric template model derives vector dimension and persists templates", async () => {
    let captured;
    database.query = async (text, params) => {
        captured = { text, params };
        return {
            rowCount: 1,
            rows: [
                {
                    id: "template-1",
                    subject_id: params[0],
                    modality: params[1],
                    template_reference: params[2],
                    vector_dimension: params[4],
                    status: params[6]
                }
            ]
        };
    };

    assert.equal(calculateVectorDimension([1, 2, 3, 4]), 4);

    const template = await createBiometricTemplate({
        subjectId: "subject-1",
        modality: "face",
        templateReference: "face-template-1",
        featureVector: [0.1, 0.2, 0.3],
        templateQuality: 91.5,
        createdBy: "user-1",
        metadata: { source: "test" }
    });

    assert.ok(captured.text.includes("INSERT INTO biometric_templates"));
    assert.equal(template.vector_dimension, 3);
    assert.equal(template.status, "enrolled");
});

test("biometric template model can revoke templates", async () => {
    database.query = async (text, params) => {
        assert.ok(text.includes("UPDATE biometric_templates"));
        assert.equal(params[0], "template-1");
        return {
            rowCount: 1,
            rows: [{ id: "template-1", subject_id: "subject-1", modality: "face", status: "revoked" }]
        };
    };

    const template = await revokeBiometricTemplate("template-1");
    assert.equal(template.status, "revoked");
});

test("audit log model writes and lists audit records", async () => {
    let auditWriteCount = 0;
    database.query = async (text, params) => {
        if (text.includes("INSERT INTO audit_logs")) {
            auditWriteCount += 1;
            assert.equal(params[1], "users.create");
            return { rowCount: 1, rows: [] };
        }

        if (text.includes("FROM audit_logs")) {
            return { rows: [{ id: 1, action: "users.create", actor_username: "admin" }] };
        }

        return { rows: [] };
    };

    await writeAuditLog({
        actorUserId: "user-1",
        action: "users.create",
        entityType: "app_user",
        entityId: "target-1",
        details: { username: "jane.doe" },
        ipAddress: "127.0.0.1"
    });

    const logs = await listAuditLogs(25);
    assert.equal(auditWriteCount, 1);
    assert.equal(logs[0].action, "users.create");
});
