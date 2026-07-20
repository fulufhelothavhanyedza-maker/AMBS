-- Phase 4 migration: biometric templates and audit indexing

CREATE TABLE IF NOT EXISTS biometric_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  modality modality_type NOT NULL,
  template_reference TEXT NOT NULL,
  feature_vector JSONB NOT NULL DEFAULT '[]'::JSONB,
  vector_dimension INTEGER NOT NULL DEFAULT 0 CHECK (vector_dimension >= 0),
  template_quality NUMERIC(5,2) CHECK (template_quality >= 0 AND template_quality <= 100),
  status enrolment_status NOT NULL DEFAULT 'pending',
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subject_id, modality, version)
);

CREATE INDEX IF NOT EXISTS idx_biometric_templates_subject_id ON biometric_templates(subject_id);
CREATE INDEX IF NOT EXISTS idx_biometric_templates_modality ON biometric_templates(modality);
CREATE INDEX IF NOT EXISTS idx_biometric_templates_status ON biometric_templates(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);

DROP TRIGGER IF EXISTS trg_biometric_templates_updated_at ON biometric_templates;
CREATE TRIGGER trg_biometric_templates_updated_at
BEFORE UPDATE ON biometric_templates
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
