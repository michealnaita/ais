import os

os.environ["ENVIRONMENT"] = "testing"

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

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
