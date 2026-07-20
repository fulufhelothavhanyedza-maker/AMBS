from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("AMBS_APP_NAME", "AMBS FastAPI")
    app_version: str = os.getenv("AMBS_APP_VERSION", "0.1.0")


_settings = Settings()


def get_settings() -> Settings:
    return _settings
