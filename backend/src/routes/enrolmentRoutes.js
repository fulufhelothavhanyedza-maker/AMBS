const express = require("express");

const { query } = require("../config/database");
const { asyncHandler, createHttpError } = require("../utils/http");
const { writeAuditLog } = require("../services/auditService");
const {
  listBiometricTemplates,
  createBiometricTemplate,
  revokeBiometricTemplate
} = require("../models/biometricTemplateModel");

const router = express.Router();

router.get(
  "/subjects",
  asyncHandler(async (request, response) => {
    const result = await query(
      `
        SELECT id, external_reference, first_name, last_name, email, phone, status, created_at
        FROM subjects
        ORDER BY created_at DESC
      `
    );

    response.json({ subjects: result.rows });
  })
);

router.post(
  "/subjects",
  asyncHandler(async (request, response) => {
    const { externalReference, firstName, lastName, email, phone } = request.body;

    if (!externalReference || !firstName || !lastName) {
      throw createHttpError(400, "externalReference, firstName, and lastName are required.");
    }

    const result = await query(
      `
        INSERT INTO subjects (
          external_reference,
          first_name,
          last_name,
          email,
          phone,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, external_reference, first_name, last_name, email, phone, status, created_at
      `,
      [externalReference, firstName, lastName, email || null, phone || null, request.user.id]
    );

    await writeAuditLog({
      actorUserId: request.user.id,
      action: "subjects.create",
      entityType: "subject",
      entityId: result.rows[0].id,
      details: { externalReference },
      ipAddress: request.ip
    });

    response.status(201).json({ subject: result.rows[0] });
  })
);

router.get(
  "/records",
  asyncHandler(async (request, response) => {
    const result = await query(
      `
        SELECT
          e.id,
          e.subject_id,
          s.external_reference,
          s.first_name,
          s.last_name,
          e.modality,
          e.template_reference,
          e.template_quality,
          e.status,
          e.enrolled_at
        FROM enrolments e
        JOIN subjects s ON s.id = e.subject_id
        ORDER BY e.enrolled_at DESC
      `
    );

    response.json({ enrolments: result.rows });
  })
);

router.post(
  "/records",
  asyncHandler(async (request, response) => {
    const {
      subjectId,
      modality,
      templateReference,
      templateQuality,
      featureVector = [],
      metadata = {}
    } = request.body;

    if (!subjectId || !modality || !templateReference) {
      throw createHttpError(400, "subjectId, modality, and templateReference are required.");
    }

    const result = await query(
      `
        INSERT INTO enrolments (
          subject_id,
          modality,
          template_reference,
          template_quality,
          status,
          enrolled_by
        )
        VALUES ($1, $2::modality_type, $3, $4, 'enrolled', $5)
        RETURNING id, subject_id, modality, template_reference, template_quality, status, enrolled_at
      `,
      [subjectId, modality, templateReference, templateQuality || null, request.user.id]
    );

    const biometricTemplate = await createBiometricTemplate({
      subjectId,
      modality,
      templateReference,
      featureVector,
      templateQuality: templateQuality || null,
      status: "enrolled",
      version: 1,
      createdBy: request.user.id,
      metadata
    });

    await writeAuditLog({
      actorUserId: request.user.id,
      action: "enrolments.create",
      entityType: "enrolment",
      entityId: result.rows[0].id,
      details: { subjectId, modality },
      ipAddress: request.ip
    });

    response.status(201).json({ enrolment: result.rows[0], biometricTemplate });
  })
);

router.get(
  "/templates",
  asyncHandler(async (request, response) => {
    response.json({ templates: await listBiometricTemplates() });
  })
);

router.delete(
  "/templates/:templateId",
  asyncHandler(async (request, response) => {
    const { templateId } = request.params;
    const template = await revokeBiometricTemplate(templateId);

    if (!template) {
      throw createHttpError(404, "Biometric template not found.");
    }

    await writeAuditLog({
      actorUserId: request.user.id,
      action: "biometric_templates.revoke",
      entityType: "biometric_template",
      entityId: templateId,
      details: { modality: template.modality, subjectId: template.subject_id },
      ipAddress: request.ip
    });

    response.json({ template });
  })
);

module.exports = router;
