const database = require("../config/database");

function calculateVectorDimension(featureVector) {
    if (!Array.isArray(featureVector)) {
        return 0;
    }

    return featureVector.length;
}

async function listBiometricTemplates() {
    const result = await database.query(
        `
      SELECT
        t.id,
        t.subject_id,
        s.external_reference,
        s.first_name,
        s.last_name,
        t.modality,
        t.template_reference,
        t.feature_vector,
        t.vector_dimension,
        t.template_quality,
        t.status,
        t.version,
        t.metadata,
        t.created_at,
        t.updated_at
      FROM biometric_templates t
      JOIN subjects s ON s.id = t.subject_id
      ORDER BY t.created_at DESC
    `
    );

    return result.rows;
}

async function createBiometricTemplate({
    subjectId,
    modality,
    templateReference,
    featureVector = [],
    templateQuality = null,
    status = "enrolled",
    version = 1,
    createdBy = null,
    metadata = {}
}) {
    const result = await database.query(
        `
      INSERT INTO biometric_templates (
        subject_id,
        modality,
        template_reference,
        feature_vector,
        vector_dimension,
        template_quality,
        status,
        version,
        created_by,
        metadata
      )
      VALUES ($1, $2::modality_type, $3, $4::jsonb, $5, $6, $7::enrolment_status, $8, $9, $10::jsonb)
      RETURNING id, subject_id, modality, template_reference, feature_vector, vector_dimension, template_quality, status, version, metadata, created_at, updated_at
    `,
        [
            subjectId,
            modality,
            templateReference,
            JSON.stringify(featureVector),
            calculateVectorDimension(featureVector),
            templateQuality,
            status,
            version,
            createdBy,
            JSON.stringify(metadata)
        ]
    );

    return result.rows[0];
}

async function revokeBiometricTemplate(templateId) {
    const result = await database.query(
        `
      UPDATE biometric_templates
      SET status = 'revoked'
      WHERE id = $1
      RETURNING id, subject_id, modality, status, updated_at
    `,
        [templateId]
    );

    return result.rowCount > 0 ? result.rows[0] : null;
}

module.exports = {
    listBiometricTemplates,
    createBiometricTemplate,
    revokeBiometricTemplate,
    calculateVectorDimension
};
