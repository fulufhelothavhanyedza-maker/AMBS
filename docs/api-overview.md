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

## User management

- `GET /api/users`
- `POST /api/users` (administrator only)
- `PATCH /api/users/:userId` (administrator only)

## Enrolment interface

- `GET /api/enrolment/subjects`
- `POST /api/enrolment/subjects`
- `GET /api/enrolment/records`
- `POST /api/enrolment/records`

## Authentication interface and engines

- `GET /api/authentication/attempts`
- `POST /api/authentication/attempts` (runs risk + adaptive modality + fusion + decision + simulated access controller)

## Engine endpoints

- `POST /api/engines/risk/evaluate`
- `POST /api/engines/modality/select`
- `POST /api/engines/fusion/run`
- `POST /api/engines/decision/run`
- `POST /api/engines/access-controller/simulate`

## Audit logs

- `GET /api/audit/logs`

## Event monitoring

- `GET /api/monitoring/events`
- `POST /api/monitoring/events`

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

## Known gaps

- `reports.html` is currently a placeholder page and is not wired to any API endpoint yet.
