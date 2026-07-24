const express = require("express");

const { query } = require("../config/database");
const { asyncHandler, createHttpError } = require("../utils/http");
const { writeAuditLog } = require("../services/auditService");
const { extractBiometrics } = require("../services/biometricEngineClient");
const {
  listBiometricTemplates,
  createBiometricTemplate,
  revokeBiometricTemplate,
  updateBiometricTemplate
} = require("../models/biometricTemplateModel");

const router = express.Router();

function normalizeExtractedSample(extractionResponse, modality) {
  const extractedSamples = Array.isArray(extractionResponse?.samples)
    ? extractionResponse.samples
    : [];

  return extractedSamples.find((sample) => sample.modality === modality) || null;
}

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

    let result;
    try {
      result = await query(
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
    } catch (error) {
      if (error?.code === "23505" && error?.constraint === "subjects_external_reference_key") {
        throw createHttpError(409, "A subject with this external reference already exists.");
      }

      throw error;
    }

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
      captureSamples = [],
      metadata = {}
    } = request.body;

    if (!subjectId || !modality) {
      throw createHttpError(400, "subjectId and modality are required.");
    }

    const extraction = Array.isArray(captureSamples) && captureSamples.length > 0
      ? await extractBiometrics({ samples: captureSamples })
      : null;
    const extractedSample = extraction
      ? normalizeExtractedSample(extraction, modality)
      : null;
    const resolvedFeatureVector = Array.isArray(featureVector) && featureVector.length > 0
      ? featureVector
      : extractedSample?.embedding || [];
    const resolvedTemplateQuality = templateQuality ?? null;
    const resolvedTemplateReference = templateReference
      || `${modality}-template-${Date.now()}`;

    if (resolvedFeatureVector.length === 0) {
      throw createHttpError(400, "featureVector or captureSamples with a matching modality is required.");
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
      [subjectId, modality, resolvedTemplateReference, resolvedTemplateQuality, request.user.id]
    );

    const biometricTemplate = await createBiometricTemplate({
      subjectId,
      modality,
      templateReference: resolvedTemplateReference,
      featureVector: resolvedFeatureVector,
      templateQuality: resolvedTemplateQuality,
      status: "enrolled",
      version: 1,
      createdBy: request.user.id,
      metadata: {
        ...metadata,
        extractionDiagnostics: extractedSample?.diagnostics || null,
        createdFromCapture: Boolean(extractedSample)
      }
    });

    await writeAuditLog({
      actorUserId: request.user.id,
      action: "enrolments.create",
      entityType: "enrolment",
      entityId: result.rows[0].id,
      details: {
        subjectId,
        modality,
        templateReference: resolvedTemplateReference,
        createdFromCapture: Boolean(extractedSample)
      },
      ipAddress: request.ip
    });

    response.status(201).json({ enrolment: result.rows[0], biometricTemplate, extraction });
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

router.patch(
  "/templates/:templateId",
  asyncHandler(async (request, response) => {
    const { templateId } = request.params;
    const {
      templateReference,
      featureVector,
      templateQuality,
      status,
      metadata
    } = request.body;

    if (
      templateReference === undefined
      && featureVector === undefined
      && templateQuality === undefined
      && status === undefined
      && metadata === undefined
    ) {
      throw createHttpError(400, "At least one template field must be provided for update.");
    }

    const template = await updateBiometricTemplate(templateId, {
      templateReference,
      featureVector,
      templateQuality,
      status,
      metadata
    });

    if (!template) {
      throw createHttpError(404, "Biometric template not found.");
    }

    await writeAuditLog({
      actorUserId: request.user.id,
      action: "biometric_templates.update",
      entityType: "biometric_template",
      entityId: templateId,
      details: {
        templateReference,
        templateQuality,
        status,
        hasFeatureVector: Array.isArray(featureVector),
        metadataKeys: metadata && typeof metadata === "object" ? Object.keys(metadata) : []
      },
      ipAddress: request.ip
    });

    response.json({ template });
  })
);

module.exports = router;
