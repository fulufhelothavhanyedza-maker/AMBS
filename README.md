# Adaptive Multimodal Biometric Security (AMBS)

AMBS is a research-oriented multimodal biometric security platform combining application services, AI pipelines, datasets, hardware integrations, database assets, and supporting thesis artefacts.

## Current workspace direction

This repository currently contains:
- an existing web application prototype under `backend/src`, `frontend`, `css`, and `javascript`
- a Python-oriented backend scaffold under `backend/app`
- research support folders for AI, datasets, hardware, database design, reports, tests, and thesis material

## Top-level structure

- `backend/` application code, tests, and Python dependencies
- `frontend/` user-facing pages
- `ai/` modality-specific and fusion components
- `datasets/` biometric datasets used for experimentation
- `hardware/` camera, sensor, controller, and Jetson integration assets
- `database/` schema design, migrations, and seed data
- `docs/` architecture, API, and UML documentation
- `logs/` runtime and experiment logs
- `reports/` generated evaluation and analysis outputs
- `tests/` end-to-end or cross-cutting tests
- `thesis/` dissertation artefacts and supporting material

## Python environment

Create and activate the local environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install backend dependencies when you are ready to start the FastAPI implementation:

```powershell
pip install -r backend/requirements.txt
```
