from pathlib import Path

from pydantic import EmailStr, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    """App settings. Values come from environment variables first, then from
    backend/.env. Secrets have no defaults, so a missing one fails at startup."""

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Secrets
    JWT_SECRET: str

    # First admin account, created by app.services.setup when no admin exists
    DEFAULT_ADMIN_EMAIL: EmailStr | None = None
    DEFAULT_ADMIN_PASSWORD: SecretStr | None = None
    DEFAULT_ADMIN_FIRST_NAME: str = "System"
    DEFAULT_ADMIN_LAST_NAME: str = "Admin"

    ENVIRONMENT: str = "development"
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'database' / 'app.db'}"
    STORAGE_DIR: Path = BASE_DIR / "storage"
    # Rendered HTML of processed documents, one <document_id>.html per document
    HTML_DIR: Path = BASE_DIR / "storage" / "html"
    # Redis serves as both the Celery broker and the result backend
    
    MODEL_DIR: Path = BASE_DIR / "models" / "all-MiniLM-L6-v2"
    CHROMA_DIR: Path = BASE_DIR / "chroma_db"
    
    REDIS_URL: str
    # Storage quota for all uploaded documents, in bytes (default 10 GiB)
    MAX_STORAGE_SIZE: int = 10 * 1024**3
    # Similarity score (0-100) at or above which a submission is flagged for
    # review; matches the frontend's "high" band
    FLAG_SIMILARITY_THRESHOLD: int = 30
    # Days an uploaded document is kept before it expires, unless it is
    # persisted (submitted, or kept by an admin)
    DOCUMENT_EXPIRY_DAYS: int = 7


Config = Settings()
