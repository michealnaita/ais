from pathlib import Path

import pytest
from app.config import Config
from app.models import Document
from fastapi.testclient import TestClient
from fixtures import (
    create_document,
    create_document_similarity_report,
    create_instructor,
    create_student,
    login,
)
from sqlalchemy.orm import Session


def test_get_document_similarity_report(db: Session, client: TestClient):
    student = create_student(db)
    instructor = create_instructor(db)
    document = create_document(db, student.id)
    create_document_similarity_report(
        db, document_id=document.id, user_id=student.id, instructor_id=instructor.id
    )
    login(client, email=student.email)
    res = client.get(f"/documents/{document.id}/similarity-report")
    assert res.status_code == 200
    assert res.json() is not None

    login(client, email=instructor.email)
    res_instructor = client.get(f"/documents/{document.id}/similarity-report")
    assert res_instructor.status_code == 200
    assert res_instructor.json() is not None


def test_upload_document(
    db: Session, client: TestClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setattr(Config, "STORAGE_DIR", tmp_path)
    content = b"test document content"
    user = create_student(db)
    login(client, email=user.email)
    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "test.docx",
                content,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["original_file_name"] == "test.docx"
    assert data["user_id"] == user.id
    assert data["size"] == len(content)

    document = db.get(Document, data["id"])
    assert document is not None
    stored_file = tmp_path / document.file_name
    assert stored_file.read_bytes() == content


def test_upload_document_unauthenticated(client: TestClient):
    response = client.post(
        "/documents/upload", files={"file": ("test.txt", b"content", "text/plain")}
    )
    assert response.status_code == 401


class DocumentSimilarityEngine:
    pass


class DocumentParsingEngine:
    pass
