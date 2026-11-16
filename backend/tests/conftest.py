import os

os.environ["ENVIRONMENT"] = "testing"
# Tests never use the real secret from .env
os.environ["JWT_SECRET"] = "test-jwt-secret-" + "x" * 32
# Required setting; tests never talk to a real Redis
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/15")

import pytest
from app.main import app
from app.services.database import Base, get_db
from fastapi.testclient import TestClient
from sqlalchemy import StaticPool, create_engine, event
from sqlalchemy.orm import sessionmaker

test_engine = create_engine(
    "sqlite:///:memory:",
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
)


# pysqlite doesn't emit BEGIN itself, so the outer transaction in `db` never
# really starts and any commit (fixture or route) persists data. Take over
# BEGIN so the rollback actually discards each test's writes.
@event.listens_for(test_engine, "connect")
def _disable_pysqlite_transactions(dbapi_connection, connection_record):
    dbapi_connection.isolation_level = None


@event.listens_for(test_engine, "begin")
def _emit_begin(conn):
    conn.exec_driver_sql("BEGIN")


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


@pytest.fixture(autouse=True)
def queued_documents(monkeypatch: pytest.MonkeyPatch) -> list[str]:
    """Stand-in for the Celery task: records the ids sent to the worker
    instead of talking to Redis."""
    from app.worker import tasks

    sent: list[str] = []
    fake_task = type("FakeTask", (), {"delay": staticmethod(sent.append)})
    monkeypatch.setattr(tasks, "process_document", fake_task)
    return sent


@pytest.fixture
def db():
    connection = test_engine.connect()
    transaction = connection.begin()

    session = SessionLocal(bind=connection, join_transaction_mode="create_savepoint")

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    # https so the client sends Secure cookies back, as a browser would
    with TestClient(app, base_url="https://testserver") as c:
        yield c

    app.dependency_overrides.clear()
