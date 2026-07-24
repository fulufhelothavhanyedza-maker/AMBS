# AMBS API Overview

## Runtime

- Start API: `npm start`
- Health check: `GET /health`
- Static frontend pages are served from `/<page>.html` (for example `/login.html`).

## Authentication

- `POST /api/auth/login` - administrator/operator login (JWT token)
- `GET /api/auth/me` - resolve current token

## Dashboard

- `GET /api/dashboard/summary`

## Reports

- `GET /api/reports/analytics`
- `POST /api/reports/analytics/export` - writes timestamped JSON/CSV analytics snapshots to `reports/` (`format`: `json`, `csv`, or `both`)
	Optional manifest fields in body: `scenarioName`, `datasetTag`, `modelVersion`, `operator`, `notes`, `tags`, `runId`.

## User management

- `GET /api/users`
- `POST /api/users` (administrator only)
- `PATCH /api/users/:userId` (administrator only)

## Enrolment interface

- `GET /api/enrolment/subjects`
- `POST /api/enrolment/subjects`
- `GET /api/enrolment/records`
- `POST /api/enrolment/records` accepts either `featureVector` or raw `captureSamples` for face or gait template creation.
- `GET /api/enrolment/templates`
- `PATCH /api/enrolment/templates/:templateId`
- `DELETE /api/enrolment/templates/:templateId`

## Authentication interface and engines

- `GET /api/authentication/attempts`
- `POST /api/authentication/attempts` (runs risk + adaptive modality + fusion + decision + simulated access controller)
	Optional request fields: `accessPointId` or `targetResource` to evaluate `access_points` and `access_policies` before the controller simulation.
	Optional request fields: `isOffHours` to raise contextual risk and `biometricEvaluationRequest` to route face/gait embeddings or raw `captureSamples` through the Python biometric engine before final decisioning.

## Engine endpoints

- `POST /api/engines/risk/evaluate`
- `POST /api/engines/modality/select`
- `POST /api/engines/fusion/run`
- `POST /api/engines/decision/run`
- `POST /api/engines/access-controller/simulate` - simulator by default, or webhook dispatch when `controllerConfig.mode` is `webhook`
- `POST /api/engines/biometrics/extract`
- `POST /api/engines/biometrics/quality`
- `POST /api/engines/biometrics/fuse`
- `POST /api/engines/biometrics/evaluate`
- `GET /api/engines/biometrics/policies/default`
- `POST /api/engines/biometrics/verify`
- `POST /api/engines/biometrics/identify`

## Controller endpoints

- `POST /api/controller/dispatch` - concrete local controller webhook implementation for door or gate commands
- `GET /api/controller/devices/:targetResource/status` - read the current local controller device state (authenticated)
- `GET /api/controller/events` - read persisted local controller dispatch events (authenticated)

## Hardware adapters

- Default local adapter: `hardware/controller/localSimulatedRelay.js`
- Runtime override: set `ACCESS_CONTROLLER_ADAPTER` to select a different controller adapter implementation
- GPIO relay scaffold: `hardware/controller/gpioRelayAdapter.js`
- GPIO relay config: `GPIO_RELAY_PIN`, `GPIO_RELAY_ACTIVE_STATE`, `GPIO_RELAY_DRY_RUN`, `GPIO_RELAY_PULSE_MS`

## Audit logs

- `GET /api/audit/logs`

## Event monitoring

- `GET /api/monitoring/events`
- `POST /api/monitoring/events`
- `GET /api/monitoring/controller/overview` - combined controller device states and persisted controller dispatch events

## System configuration

- `GET /api/configuration`
- `PUT /api/configuration/:key` (administrator only)

## Frontend coverage

The following pages are wired to the API through `javascript/app.js`:

- `login.html` -> administrator login
- `dashboard.html` -> dashboard summary
- `users.html` -> user management
- `enrollment.html` -> enrolment interface
- `authentication.html` -> authentication interface and engines
- `audit.html` -> audit logs
- `monitoring.html` -> event monitoring
- `settings.html` -> system configuration
- `reports.html` -> reports and analytics
