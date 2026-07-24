-- Phase 5 migration: align persisted modality defaults with the face-plus-gait AMBS design.

DO $$
BEGIN
  ALTER TYPE modality_type RENAME VALUE 'facial' TO 'face';
EXCEPTION
  WHEN invalid_parameter_value THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

UPDATE system_configuration
SET value = '["face"]'::jsonb,
    description = 'Default modalities for low-risk authentication'
WHERE key = 'authentication.defaultModalities';

UPDATE modality_selection_rules
SET selected_modalities = ARRAY['face']::modality_type[],
    description = 'Low risk face-first authentication'
WHERE name = 'low-risk-default';

UPDATE modality_selection_rules
SET selected_modalities = ARRAY['face', 'gait']::modality_type[],
    description = 'Medium risk multimodal step-up'
WHERE name = 'medium-risk-step-up';

UPDATE modality_selection_rules
SET selected_modalities = ARRAY['face', 'gait']::modality_type[],
    description = 'High risk multimodal strong authentication'
WHERE name = 'high-risk-strong';