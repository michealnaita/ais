from datetime import timedelta
from pathlib import Path
from types import SimpleNamespace

import pytest
from app.config import Config
from app.models import Document
from app.routes.documents import DOCX_MIME_TYPE
from fastapi.testclient import TestClient
from fixtures import (
    create_document,
    create_student,
    create_user,
    login,
)
from sqlalchemy.orm import Session


DOCX_FIXTURE = Path(__file__).parent / "fixtures" / "test_upload.docx"


def upload(client: TestClient, name: str, content: bytes, content_type: str):
    return client.post("/documents/upload", files={"file": (name, content, content_type)})


def test_upload_document(
    db: Session,
    client: TestClient,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    queued_documents: list[str],
):
    monkeypatch.setattr(Config, "STORAGE_DIR", tmp_path)
    content = DOCX_FIXTURE.read_bytes()
    user = create_student(db)
    login(client, email=user.email)
    response = upload(client, "test.docx", content, DOCX_MIME_TYPE)
    assert response.status_code == 200
    data = response.json()
    assert data["originalFileName"] == "test.docx"
    assert data["authorId"] == user.id
    assert data["authorName"] == f"{user.first_name} {user.last_name}"
    assert data["size"] == len(content)
    assert data["mimeType"] == DOCX_MIME_TYPE

    document = db.get(Document, data["id"])
    assert document is not None
    assert document.file_name.endswith(".docx")
    stored_file = tmp_path / document.file_name
    assert stored_file.read_bytes() == content
    # Uploads expire a week later unless persisted
    expected_expiry = document.uploaded_at + timedelta(days=Config.DOCUMENT_EXPIRY_DAYS)
    assert abs(document.expires_at - expected_expiry) < timedelta(seconds=5)
    assert data["expiresAt"] is not None
    # Uploading alone doesn't send the document for processing
    assert queued_documents == []


@pytest.mark.parametrize(
    "name, content, content_type",
    [
        # Wrong extension, even with real Word content
        ("essay.pdf", DOCX_FIXTURE.read_bytes(), "application/pdf"),
        ("essay.txt", b"plain text", "text/plain"),
        # Legacy binary Word format
        ("essay.doc", b"\xd0\xcf\x11\xe0 legacy word", "application/msword"),
        # Renamed to .docx and claims the Word MIME type, but isn't one
        ("essay.docx", b"%PDF-1.7 not a word doc", DOCX_MIME_TYPE),
        # A ZIP, but not a Word document
        ("essay.docx", b"PK\x05\x06" + b"\x00" * 18, DOCX_MIME_TYPE),
    ],
)
def test_upload_rejects_non_word_files(
    db: Session,
    client: TestClient,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    name: str,
    content: bytes,
    content_type: str,
):
    monkeypatch.setattr(Config, "STORAGE_DIR", tmp_path)
    user = create_student(db)
    login(client, email=user.email)

    response = upload(client, name, content, content_type)

    assert response.status_code == 415
    assert db.query(Document).count() == 0
    assert list(tmp_path.iterdir()) == []


def test_upload_accepts_uppercase_extension(
    db: Session, client: TestClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setattr(Config, "STORAGE_DIR", tmp_path)
    user = create_student(db)
    login(client, email=user.email)

    response = upload(client, "ESSAY.DOCX", DOCX_FIXTURE.read_bytes(), DOCX_MIME_TYPE)

    assert response.status_code == 200


def test_upload_document_unauthenticated(client: TestClient):
    response = client.post(
        "/documents/upload", files={"file": ("test.txt", b"content", "text/plain")}
    )
    assert response.status_code == 401


class DocumentSimilarityEngine:
    pass


class DocumentParsingEngine:
    pass


@pytest.fixture
def documents_by_two_students(db: Session):
    """An admin, and two students with one document each."""
    admin = create_user(db, role="admin", email="admin@test.com")
    alice = create_student(db, email="alice@test.com", first_name="Alice")
    bob = create_student(db, email="bob@test.com", first_name="Bob")
    documents = [
        create_document(db, alice.id, original_file_name="alice.docx"),
        create_document(db, bob.id, original_file_name="bob.docx"),
    ]
    return SimpleNamespace(admin=admin, alice=alice, bob=bob, documents=documents)


def test_admin_gets_all_documents(client: TestClient, documents_by_two_students):
    data = documents_by_two_students
    login(client, email=data.admin.email)

    res = client.get("/documents/")

    assert res.status_code == 200
    by_id = {d["id"]: d for d in res.json()}
    assert set(by_id) == {d.id for d in data.documents}
    alice_doc = by_id[data.documents[0].id]
    assert alice_doc["authorName"] == f"{data.alice.first_name} {data.alice.last_name}"


def test_non_admin_cannot_get_all_documents(
    client: TestClient, documents_by_two_students
):
    login(client, email=documents_by_two_students.alice.email)

    res = client.get("/documents/")

    assert res.status_code == 403


class TestBulkPersist:
    def test_admin_persists_and_queues_documents(
        self,
        db: Session,
        client: TestClient,
        documents_by_two_students,
        queued_documents: list[str],
    ):
        data = documents_by_two_students
        login(client, email=data.admin.email)
        ids = [d.id for d in data.documents]

        res = client.post(
            "/documents/bulk-upload", json={"documentIds": [*ids, "missing-id"]}
        )

        assert res.status_code == 200
        assert res.json() == {
            "persistedIds": ids,
            "notFoundIds": ["missing-id"],
            "queuedIds": ids,
        }
        assert sorted(queued_documents) == sorted(ids)
        for document in data.documents:
            db.refresh(document)
            assert document.expires_at is None

    def test_only_queued_documents_are_processed(
        self,
        db: Session,
        client: TestClient,
        documents_by_two_students,
        queued_documents: list[str],
    ):
        data = documents_by_two_students
        queued, done = data.documents
        done.status = "processed"
        db.commit()
        login(client, email=data.admin.email)

        res = client.post(
            "/documents/bulk-upload", json={"documentIds": [queued.id, done.id]}
        )

        assert res.status_code == 200
        assert res.json()["persistedIds"] == [queued.id, done.id]
        assert res.json()["queuedIds"] == [queued.id]
        assert queued_documents == [queued.id]

    def test_broker_error_still_persists(
        self,
        db: Session,
        client: TestClient,
        documents_by_two_students,
        monkeypatch: pytest.MonkeyPatch,
    ):
        from app.worker import tasks

        def broker_down(document_id):
            raise ConnectionError("redis unavailable")

        monkeypatch.setattr(tasks.process_document, "delay", broker_down)
        data = documents_by_two_students
        login(client, email=data.admin.email)
        document = data.documents[0]

        res = client.post("/documents/bulk-upload", json={"documentIds": [document.id]})

        assert res.status_code == 200
        assert res.json()["queuedIds"] == []
        db.refresh(document)
        assert document.expires_at is None

    def test_non_admin_forbidden(
        self,
        db: Session,
        client: TestClient,
        documents_by_two_students,
        queued_documents: list[str],
    ):
        data = documents_by_two_students
        login(client, email=data.alice.email)

        res = client.post(
            "/documents/bulk-upload", json={"documentIds": [data.documents[0].id]}
        )

        assert res.status_code == 403
        db.refresh(data.documents[0])
        assert data.documents[0].expires_at is not None
        assert queued_documents == []

    def test_rejects_empty_list(self, client: TestClient, documents_by_two_students):
        login(client, email=documents_by_two_students.admin.email)

        res = client.post("/documents/bulk-upload", json={"documentIds": []})

        assert res.status_code == 422
