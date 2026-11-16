from contextlib import nullcontext
from types import SimpleNamespace

import pytest
from app.worker import status as worker_status


class FakeConnection:
    def __init__(self, error: Exception | None = None):
        self.error = error

    def ensure_connection(self, **kwargs):
        if self.error:
            raise self.error


def patch_celery(monkeypatch, connection: FakeConnection, ping_replies):
    app = worker_status.celery_app
    monkeypatch.setattr(app, "connection_for_write", lambda: nullcontext(connection))
    inspector = SimpleNamespace(ping=lambda: ping_replies)
    monkeypatch.setattr(app.control, "inspect", lambda timeout: inspector)


def test_running_when_a_worker_answers(monkeypatch: pytest.MonkeyPatch):
    patch_celery(
        monkeypatch,
        FakeConnection(),
        {"w1@host": {"ok": "pong"}, "w2@host": {"ok": "pong"}},
    )

    assert worker_status.get_worker_status() == "running"


def test_stopped_when_broker_up_but_no_workers(monkeypatch: pytest.MonkeyPatch):
    patch_celery(monkeypatch, FakeConnection(), None)

    assert worker_status.get_worker_status() == "stopped"


def test_stopped_when_broker_down(monkeypatch: pytest.MonkeyPatch):
    patch_celery(monkeypatch, FakeConnection(ConnectionError("refused")), {})

    assert worker_status.get_worker_status() == "stopped"
