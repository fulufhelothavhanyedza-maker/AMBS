# AMBS Production Architecture Freeze (Week 1 Target)

## Decision

The AMBS implementation is frozen to the following production architecture:

- Orchestration/API: Node.js + Express (`backend/src`)
- Biometric engine: Python + FastAPI (`backend/app`)
- Database: PostgreSQL (`backend/src/db/schema.sql`)
- Access controller bridge: Node service + pluggable hardware adapters (`backend/src/services/hardwareControllerAdapter.js`)
- Default controller mode during pre-hardware phase: local simulated relay (`hardware/controller/localSimulatedRelay.js`)

## Deployment Boundary

- Node API is the system entry point for web/admin/authentication requests.
- Python biometric engine is a dedicated internal service reachable over HTTP using `BIOMETRIC_ENGINE_URL`.
- Hardware-specific behavior is isolated behind adapter interfaces; business logic must not depend on a specific relay vendor.

## Runtime Safety Defaults

- Biometric engine calls use timeout/retry controls.
- If biometric extraction/evaluation fails, AMBS enters degraded mode and forces a non-allow outcome (`review` at minimum).
- Controller dispatch remains explicit and auditable for every final decision.

## Environment Controls

Biometric engine client:

- `BIOMETRIC_ENGINE_URL`
- `BIOMETRIC_ENGINE_TIMEOUT_MS` (default: 4500)
- `BIOMETRIC_ENGINE_RETRY_COUNT` (default: 1)
- `BIOMETRIC_ENGINE_RETRY_DELAY_MS` (default: 250)

Biometric extraction provider:

- `AMBS_EXTRACTION_PROVIDER` (`heuristic` or `model`)
- `AMBS_ALLOW_EXTRACTION_FALLBACK` (`true` or `false`)
- `AMBS_FACE_EXTRACTOR` (format: `<module>:<function>`)
- `AMBS_GAIT_EXTRACTOR` (format: `<module>:<function>`)

## Implementation Notes

The `model` extraction provider is intentionally scaffolded to receive real-world face/gait embedding functions without changing API contracts. During transition, the heuristic fallback remains available so integration and evaluation workflows can continue.
