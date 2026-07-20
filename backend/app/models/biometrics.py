from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from backend.app.schemas.biometrics import BiometricModality


@dataclass(slots=True)
class BiometricTemplate:
    subject_id: str
    modality: BiometricModality
    embedding: list[float]
    quality_score: float
    active: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)
