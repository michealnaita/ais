import pytest
from app import models
from app.config import Config
from app.services.setup import create_default_admin
from fastapi.testclient import TestClient
from pydantic import SecretStr
from sqlalchemy import select
from sqlalchemy.orm import Session
from tests.fixtures import create_user

ADMIN_EMAIL = "first-admin@test.com"
ADMIN_PASSWORD = "first-admin-password"


@pytest.fixture
def default_admin_settings(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(Config, "DEFAULT_ADMIN_EMAIL", ADMIN_EMAIL)
    monkeypatch.setattr(Config, "DEFAULT_ADMIN_PASSWORD", SecretStr(ADMIN_PASSWORD))


@pytest.fixture
def existing_admin(db: Session):
    return create_user(db, role="admin", email="existing-admin@test.com")


def admins(db: Session):
    return db.execute(select(models.User).where(models.User.role == "admin")).scalars().all()


def test_creates_default_admin_who_can_log_in(
    client: TestClient, db: Session, default_admin_settings
):
    created = create_default_admin(db)

    assert [a.email for a in admins(db)] == [ADMIN_EMAIL]
    assert created.email == ADMIN_EMAIL
    res = client.post(
        "/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    assert res.status_code == 200


def test_skips_when_an_admin_exists(
    db: Session, default_admin_settings, existing_admin
):
    assert create_default_admin(db) is None
    assert [a.email for a in admins(db)] == [existing_admin.email]


def test_skips_when_settings_missing(db: Session, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(Config, "DEFAULT_ADMIN_EMAIL", None)
    monkeypatch.setattr(Config, "DEFAULT_ADMIN_PASSWORD", None)

    assert create_default_admin(db) is None
    assert admins(db) == []
