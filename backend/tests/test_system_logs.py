from datetime import datetime, timedelta
from types import SimpleNamespace

import pytest
from app.models import SystemLog
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.fixtures import create_student, create_user, login


@pytest.fixture
def logs(db: Session):
    """An admin, a student, and two log entries a minute apart."""
    admin = create_user(db, role="admin", email="admin@test.com")
    student = create_student(db, email="student@test.com")
    now = datetime(2026, 11, 13, 12, 0)
    older = SystemLog(
        timestamp=now - timedelta(minutes=1),
        level="info",
        type="user.created",
        source="api.users",
        message="older",
    )
    newer = SystemLog(
        timestamp=now,
        level="warning",
        type="auth.login_failed",
        source="api.auth",
        message="newer",
    )
    db.add_all([older, newer])
    db.commit()
    return SimpleNamespace(admin=admin, student=student, older=older, newer=newer)


def test_admin_gets_logs_newest_first(client: TestClient, logs):
    login(client, logs.admin.email)

    res = client.get("/system-logs/")

    assert res.status_code == 200
    entries = [e for e in res.json() if e["id"] in {logs.older.id, logs.newer.id}]
    assert [e["message"] for e in entries] == ["newer", "older"]
    assert set(entries[0]) == {"id", "timestamp", "level", "message", "type", "source"}


def test_non_admin_cannot_get_logs(client: TestClient, logs):
    login(client, logs.student.email)

    assert client.get("/system-logs/").status_code == 403


def test_audited_action_is_logged(client: TestClient, logs):
    client.post(
        "/auth/login", json={"email": logs.student.email, "password": "wrong"}
    )
    login(client, logs.admin.email)

    entries = client.get("/system-logs/").json()

    failed = [
        e
        for e in entries
        if e["type"] == "auth.login_failed" and logs.student.email in e["message"]
    ]
    assert len(failed) == 1
    assert failed[0]["level"] == "warning"
    assert failed[0]["source"] == "api.auth"
