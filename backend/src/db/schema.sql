CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('administrator', 'operator', 'auditor', 'security_officer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE account_status AS ENUM ('active', 'disabled', 'locked');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE modality_type AS ENUM ('face', 'gait', 'fingerprint', 'iris', 'voice');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE enrolment_status AS ENUM ('pending', 'enrolled', 'rejected', 'revoked');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE authentication_status AS ENUM ('initiated', 'passed', 'failed', 'challenged');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE event_severity AS ENUM ('info', 'warning', 'critical');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE decision_outcome AS ENUM ('allow', 'deny', 'review');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role user_role NOT NULL DEFAULT 'operator',
  status account_status NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_reference VARCHAR(100) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  status account_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  location VARCHAR(255) NOT NULL,
  security_level VARCHAR(50) NOT NULL,
  status account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_point_id UUID NOT NULL REFERENCES access_points(id) ON DELETE CASCADE,
  permitted_start_time TIME NOT NULL,
  permitted_end_time TIME NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  step_up_required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrolments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  modality modality_type NOT NULL,
  template_reference TEXT NOT NULL,
  template_quality NUMERIC(5,2) CHECK (template_quality >= 0 AND template_quality <= 100),
  status enrolment_status NOT NULL DEFAULT 'pending',
  enrolled_by UUID REFERENCES app_users(id),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subject_id, modality)
);

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

CREATE TABLE IF NOT EXISTS authentication_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  requested_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  primary_modality modality_type NOT NULL,
  status authentication_status NOT NULL DEFAULT 'initiated',
  confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  risk_score NUMERIC(5,2) CHECK (risk_score >= 0 AND risk_score <= 100),
  source_channel VARCHAR(100) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  action VARCHAR(150) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(150),
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monitoring_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(150) NOT NULL,
  severity event_severity NOT NULL DEFAULT 'info',
  source_component VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_configuration (
  key VARCHAR(150) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authentication_attempt_id UUID NOT NULL REFERENCES authentication_attempts(id) ON DELETE CASCADE,
  risk_score NUMERIC(5,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level VARCHAR(50) NOT NULL,
  factors JSONB NOT NULL DEFAULT '[]'::JSONB,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modality_selection_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  minimum_risk_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (minimum_risk_score >= 0 AND minimum_risk_score <= 100),
  maximum_risk_score NUMERIC(5,2) NOT NULL DEFAULT 100 CHECK (maximum_risk_score >= 0 AND maximum_risk_score <= 100),
  selected_modalities modality_type[] NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fusion_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authentication_attempt_id UUID NOT NULL REFERENCES authentication_attempts(id) ON DELETE CASCADE,
  participating_modalities modality_type[] NOT NULL,
  fused_score NUMERIC(5,2) NOT NULL CHECK (fused_score >= 0 AND fused_score <= 100),
  algorithm_version VARCHAR(100) NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authentication_attempt_id UUID NOT NULL REFERENCES authentication_attempts(id) ON DELETE CASCADE,
  risk_assessment_id UUID REFERENCES risk_assessments(id) ON DELETE SET NULL,
  fusion_result_id UUID REFERENCES fusion_results(id) ON DELETE SET NULL,
  outcome decision_outcome NOT NULL,
  rationale JSONB NOT NULL DEFAULT '{}'::JSONB,
  decided_by VARCHAR(100) NOT NULL DEFAULT 'decision_engine',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_controller_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  target_resource VARCHAR(150) NOT NULL,
  controller_response VARCHAR(100) NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_payload JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE TABLE IF NOT EXISTS controller_dispatch_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_resource VARCHAR(150) NOT NULL,
  outcome VARCHAR(50) NOT NULL,
  controller_response VARCHAR(100) NOT NULL,
  access_point JSONB,
  command_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  device_state VARCHAR(50) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS controller_device_state (
  target_resource VARCHAR(150) PRIMARY KEY,
  access_point JSONB,
  outcome VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  last_command JSONB NOT NULL DEFAULT '{}'::JSONB,
  last_event_id UUID REFERENCES controller_dispatch_events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subjects_status ON subjects(status);
CREATE INDEX IF NOT EXISTS idx_access_points_status ON access_points(status);
CREATE INDEX IF NOT EXISTS idx_access_policies_access_point_id ON access_policies(access_point_id);
CREATE INDEX IF NOT EXISTS idx_enrolments_subject_id ON enrolments(subject_id);
CREATE INDEX IF NOT EXISTS idx_authentication_attempts_subject_id ON authentication_attempts(subject_id);
CREATE INDEX IF NOT EXISTS idx_authentication_attempts_status ON authentication_attempts(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_biometric_templates_subject_id ON biometric_templates(subject_id);
CREATE INDEX IF NOT EXISTS idx_biometric_templates_modality ON biometric_templates(modality);
CREATE INDEX IF NOT EXISTS idx_biometric_templates_status ON biometric_templates(status);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_created_at ON monitoring_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_severity ON monitoring_events(severity);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_attempt_id ON risk_assessments(authentication_attempt_id);
CREATE INDEX IF NOT EXISTS idx_fusion_results_attempt_id ON fusion_results(authentication_attempt_id);
CREATE INDEX IF NOT EXISTS idx_decisions_attempt_id ON decisions(authentication_attempt_id);
CREATE INDEX IF NOT EXISTS idx_access_controller_events_target_resource ON access_controller_events(target_resource);
CREATE INDEX IF NOT EXISTS idx_controller_dispatch_events_target_resource ON controller_dispatch_events(target_resource);
CREATE INDEX IF NOT EXISTS idx_controller_dispatch_events_delivered_at ON controller_dispatch_events(delivered_at DESC);

DROP TRIGGER IF EXISTS trg_app_users_updated_at ON app_users;
CREATE TRIGGER trg_app_users_updated_at
BEFORE UPDATE ON app_users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_subjects_updated_at ON subjects;
CREATE TRIGGER trg_subjects_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_enrolments_updated_at ON enrolments;
CREATE TRIGGER trg_enrolments_updated_at
BEFORE UPDATE ON enrolments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_biometric_templates_updated_at ON biometric_templates;
CREATE TRIGGER trg_biometric_templates_updated_at
BEFORE UPDATE ON biometric_templates
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_system_configuration_updated_at ON system_configuration;
CREATE TRIGGER trg_system_configuration_updated_at
BEFORE UPDATE ON system_configuration
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_modality_selection_rules_updated_at ON modality_selection_rules;
CREATE TRIGGER trg_modality_selection_rules_updated_at
BEFORE UPDATE ON modality_selection_rules
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_controller_device_state_updated_at ON controller_device_state;
CREATE TRIGGER trg_controller_device_state_updated_at
BEFORE UPDATE ON controller_device_state
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
