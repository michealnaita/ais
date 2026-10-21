import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]


class Config:
    JWT_SECRET = os.getenv(
        "JWT_SECRET", "d1134f1c91c0fbd3566fa34e30e0838fc27326441ccf643d97028c7fd9af7222"
    )  # hard coded for development purposes, should be set as an environment variable in production
    DATABASE_URL = f"sqlite:///{BASE_DIR / 'data' / 'app.db'}"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    STORAGE_DIR = BASE_DIR / "storage"
