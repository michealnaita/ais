from datetime import datetime
from types import SimpleNamespace

import pytest
from app.config import Config
from app.models import Document, DocumentChunk, SimilarChunk, Submission
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.fixtures import (
    create_assignment,
    create_assignment_submissions,
    create_document,
    create_document_similarity_report,
    create_enrollment,
    create_instructor,
    create_student,
    create_user_submissions,
    login,
)


def test_create_submission(db: Session, client: TestClient):
    student = create_student(db)
    document = create_document(db, author_id=student.id)
    assignment = create_enrollment(db, student_id=student.id).assignment
    not_enrolled_assignment = create_assignment(db)
    login(client, student.email)
    res_success = client.post(
        "/submissions",
        json={
            "assignmentId": assignment.id,
            "documentId": document.id,
        },
    )
    assert res_success.status_code == 200
    assert res_success.json()["fileName"] == document.original_file_name

    res_not_enrolled = client.post(
        "/submissions",
        json={
            "assignmentId": not_enrolled_assignment.id,
            "documentId": document.id,
        },
    )
    assert res_not_enrolled.status_code == 403

    res_assignment_not_found = client.post(
        "/submissions",
        json={
            "assignmentId": "missing-assignment-id",
            "documentId": document.id,
        },
    )
    assert res_assignment_not_found.status_code == 404

    other_student = create_student(db, email="other-student@test.com")
    other_document = create_document(db, author_id=other_student.id)
    res_other_users_document = client.post(
        "/submissions",
        json={
            "assignmentId": assignment.id,
            "documentId": other_document.id,
        },
    )
    assert res_other_users_document.status_code == 404


def test_resubmission_replaces_previous_submission(db: Session, client: TestClient):
    student = create_student(db)
    first_document = create_document(db, author_id=student.id)
    second_document = create_document(
        db, author_id=student.id, original_file_name="second.pdf"
    )
    assignment = create_enrollment(db, student_id=student.id).assignment
    login(client, student.email)

    res_first = client.post(
        "/submissions",
        json={"assignmentId": assignment.id, "documentId": first_document.id},
    )
    res_second = client.post(
        "/submissions",
        json={"assignmentId": assignment.id, "documentId": second_document.id},
    )
    assert res_first.status_code == 200
    assert res_second.status_code == 200
    assert res_second.json()["id"] == res_first.json()["id"]

    submissions = db.query(Submission).filter_by(user_id=student.id).all()
    assert len(submissions) == 1
    assert submissions[0].document_id == second_document.id


def test_submission_queues_document_for_processing(
    db: Session, client: TestClient, queued_documents: list[str]
):
    student = create_student(db)
    document = create_document(db, author_id=student.id)
    assignment = create_enrollment(db, student_id=student.id).assignment
    login(client, student.email)

    res = client.post(
        "/submissions",
        json={"assignmentId": assignment.id, "documentId": document.id},
    )

    assert res.status_code == 200
    assert queued_documents == [document.id]


def test_submission_does_not_reprocess_processed_document(
    db: Session, client: TestClient, queued_documents: list[str]
):
    student = create_student(db)
    document = create_document(db, author_id=student.id, status="processed")
    assignment = create_enrollment(db, student_id=student.id).assignment
    login(client, student.email)

    res = client.post(
        "/submissions",
        json={"assignmentId": assignment.id, "documentId": document.id},
    )

    assert res.status_code == 200
    assert queued_documents == []


def test_rejected_submission_does_not_queue(
    db: Session, client: TestClient, queued_documents: list[str]
):
    student = create_student(db)
    document = create_document(db, author_id=student.id)
    not_enrolled = create_assignment(db)
    login(client, student.email)

    res = client.post(
        "/submissions",
        json={"assignmentId": not_enrolled.id, "documentId": document.id},
    )

    assert res.status_code == 403
    assert queued_documents == []


def test_resubmitting_same_document_fails(
    db: Session, client: TestClient, queued_documents: list[str]
):
    student = create_student(db)
    document = create_document(db, author_id=student.id)
    assignment = create_enrollment(db, student_id=student.id).assignment
    login(client, student.email)
    payload = {"assignmentId": assignment.id, "documentId": document.id}
    first = client.post("/submissions", json=payload)
    queued_documents.clear()

    res = client.post("/submissions", json=payload)

    assert first.status_code == 200
    assert res.status_code == 409
    assert res.json()["detail"] == "Document is already submitted to this assignment"
    # Nothing was deleted or re-sent
    assert db.get(Document, document.id) is not None
    assert db.query(Submission).filter_by(document_id=document.id).count() == 1
    assert queued_documents == []


def test_submission_persists_document(db: Session, client: TestClient):
    student = create_student(db)
    document = create_document(db, author_id=student.id)
    assignment = create_enrollment(db, student_id=student.id).assignment
    assert document.expires_at is not None
    login(client, student.email)

    res = client.post(
        "/submissions",
        json={"assignmentId": assignment.id, "documentId": document.id},
    )

    assert res.status_code == 200
    db.refresh(document)
    assert document.expires_at is None


def test_cannot_submit_to_closed_assignment(db: Session, client: TestClient):
    student = create_student(db)
    first_document = create_document(db, author_id=student.id)
    second_document = create_document(db, author_id=student.id)
    assignment = create_enrollment(db, student_id=student.id).assignment
    login(client, student.email)

    res_first = client.post(
        "/submissions",
        json={"assignmentId": assignment.id, "documentId": first_document.id},
    )
    assert res_first.status_code == 200

    assignment.status = "closed"
    db.commit()

    res_resubmit = client.post(
        "/submissions",
        json={"assignmentId": assignment.id, "documentId": second_document.id},
    )
    assert res_resubmit.status_code == 400
    submission = db.query(Submission).filter_by(user_id=student.id).one()
    assert submission.document_id == first_document.id


def test_get_student_submissions(db: Session, client: TestClient):
    student = create_student(db)
    other_student = create_student(db, email="other-student@test.com")
    create_user_submissions(db, user_id=student.id)

    login(client, student.email)
    res = client.get("/submissions")
    assert res.status_code == 200
    assert len(res.json()) == 1

    login(client, other_student.email)
    res_no_submissions = client.get(
        "/submissions", params={"userId": other_student.id}
    )
    assert res_no_submissions.status_code == 200
    assert res_no_submissions.json() == []


def test_get_assignment_submissions(db: Session, client: TestClient):
    instructor = create_instructor(db)
    assignment = create_assignment(db, instructor_id=instructor.id)
    other_assignment = create_assignment(db, instructor_id=instructor.id)
    create_assignment_submissions(db, assignment_id=assignment.id)
    login(client, instructor.email)
    res = client.get(
        "/submissions",
        params={
            "assignmentId": assignment.id,
        },
    )
    assert res.status_code == 200
    assert len(res.json()) == 1

    res_other_assignment = client.get(
        "/submissions",
        params={
            "assignmentId": other_assignment.id,
        },
    )
    assert res_other_assignment.status_code == 200
    assert res_other_assignment.json() == []

    student = create_student(db, email="nosy-student@test.com")
    login(client, student.email)
    res_student = client.get("/submissions", params={"assignmentId": assignment.id})
    assert res_student.status_code == 403


@pytest.fixture
def scored_submission(db: Session):
    """A processed (scored, with matched chunks) submission to an instructor's
    assignment, created with the system's default threshold."""
    instructor = create_instructor(db)
    student = create_student(db)
    document = create_document(
        db, author_id=student.id, status="completed", similarity_score=42
    )
    create_document_similarity_report(
        db, student.id, document.id, instructor_id=instructor.id
    )
    submission = db.query(Submission).filter_by(document_id=document.id).one()
    return SimpleNamespace(
        instructor=instructor, student=student, document=document, submission=submission
    )


class TestSimilarityThreshold:
    def test_defaults_to_system_threshold(self, scored_submission):
        assert (
            scored_submission.submission.similarity_threshold
            == Config.FLAG_SIMILARITY_THRESHOLD
        )

    def test_instructor_change_requeues_document(
        self,
        client: TestClient,
        db: Session,
        scored_submission,
        queued_documents: list[str],
    ):
        data = scored_submission
        login(client, data.instructor.email)

        res = client.patch(
            f"/submissions/{data.submission.id}/similarity-threshold",
            json={"similarityThreshold": 55},
        )

        assert res.status_code == 200
        assert res.json()["similarityThreshold"] == 55
        assert res.json()["documentStatus"] == "queued"
        db.refresh(data.document)
        assert data.document.status == "queued"
        assert data.document.similarity_score is None
        assert (
            db.query(SimilarChunk).filter_by(document_id=data.document.id).count() == 0
        )
        assert queued_documents == [data.document.id]

    def test_same_value_keeps_results(
        self,
        client: TestClient,
        db: Session,
        scored_submission,
        queued_documents: list[str],
    ):
        data = scored_submission
        login(client, data.instructor.email)

        res = client.patch(
            f"/submissions/{data.submission.id}/similarity-threshold",
            json={"similarityThreshold": Config.FLAG_SIMILARITY_THRESHOLD},
        )

        assert res.status_code == 200
        db.refresh(data.document)
        assert data.document.status == "completed"
        assert queued_documents == []

    def test_only_owning_instructor(self, client: TestClient, scored_submission):
        login(client, scored_submission.student.email)

        res = client.patch(
            f"/submissions/{scored_submission.submission.id}/similarity-threshold",
            json={"similarityThreshold": 55},
        )

        assert res.status_code == 403

    def test_rejects_out_of_range(self, client: TestClient, scored_submission):
        login(client, scored_submission.instructor.email)

        res = client.patch(
            f"/submissions/{scored_submission.submission.id}/similarity-threshold",
            json={"similarityThreshold": 101},
        )

        assert res.status_code == 422


def add_chunks(db: Session, document_id: str, prefix: str, count: int):
    chunks = [
        DocumentChunk(document_id=document_id, index=i, content=f"{prefix} {i}")
        for i in range(count)
    ]
    db.add_all(chunks)
    db.flush()
    return chunks


@pytest.fixture
def report_data(db: Session):
    """A scored submission whose document has 3 passages. Source A matches
    passages 0 (twice) and 1; source B matches passage 2."""
    instructor = create_instructor(db)
    student = create_student(db)
    alice = create_student(
        db, email="alice@test.com", first_name="Alice", last_name="Author"
    )
    document = create_document(
        db, author_id=student.id, status="completed", similarity_score=50
    )
    source_a = create_document(db, author_id=alice.id, uploaded_at=datetime(2025, 3, 1))
    source_b = create_document(db, author_id=alice.id)
    mine = add_chunks(db, document.id, "mine", 3)
    a = add_chunks(db, source_a.id, "a", 3)
    b = add_chunks(db, source_b.id, "b", 1)
    db.add_all(
        SimilarChunk(
            document_id=document.id,
            document_chunk_id=own.id,
            matched_chunk_id=matched.id,
        )
        for own, matched in [
            (mine[0], a[0]),
            (mine[0], a[1]),
            (mine[1], a[2]),
            (mine[2], b[0]),
        ]
    )
    assignment = create_enrollment(
        db, student_id=student.id, instructor_id=instructor.id
    ).assignment
    submission = Submission(
        user_id=student.id, assignment_id=assignment.id, document_id=document.id
    )
    db.add(submission)
    db.commit()
    return SimpleNamespace(
        student=student,
        document=document,
        submission=submission,
        source_a=source_a,
        source_b=source_b,
        mine=mine,
        a=a,
    )


class TestGetSubmission:
    def test_includes_similarity_report(self, client: TestClient, report_data):
        data = report_data
        login(client, data.student.email)

        res = client.get(f"/submissions/{data.submission.id}")

        assert res.status_code == 200
        body = res.json()
        assert body["documentId"] == data.document.id
        report = body["similarityReport"]
        assert report["id"] == data.document.id
        assert report["similarityScore"] == 50  # stored score, not recomputed
        assert report["similarityThreshold"] == Config.FLAG_SIMILARITY_THRESHOLD
        assert report["similarityBand"] == ""
        # Highest score first; 2 of 3 passages -> 67, 1 of 3 -> 33
        assert [
            (d["id"], d["similarityScore"]) for d in report["similarDocuments"]
        ] == [(data.source_a.id, 67), (data.source_b.id, 33)]
        source_a = report["similarDocuments"][0]
        assert source_a["authorName"] == "Alice Author"
        assert source_a["uploadedYear"] == 2025
        def pair(own, matched):
            return {
                "chunk": {"id": own.id, "content": own.content},
                "matchedChunk": {"id": matched.id, "content": matched.content},
            }

        assert source_a["similarChunks"] == [
            pair(data.mine[0], data.a[0]),
            pair(data.mine[0], data.a[1]),
            pair(data.mine[1], data.a[2]),
        ]

    def test_instructor_can_view(self, client: TestClient, scored_submission):
        login(client, scored_submission.instructor.email)

        res = client.get(f"/submissions/{scored_submission.submission.id}")

        assert res.status_code == 200

    def test_other_student_cannot_view(
        self, client: TestClient, db: Session, scored_submission
    ):
        other = create_student(db, email="nosy@test.com")
        login(client, other.email)

        res = client.get(f"/submissions/{scored_submission.submission.id}")

        assert res.status_code == 403

    def test_no_report_until_processed(
        self, client: TestClient, db: Session, scored_submission
    ):
        data = scored_submission
        login(client, data.instructor.email)
        client.patch(
            f"/submissions/{data.submission.id}/similarity-threshold",
            json={"similarityThreshold": 55},
        )

        res = client.get(f"/submissions/{data.submission.id}")

        assert res.status_code == 200
        assert res.json()["similarityReport"] is None


class TestSimilarityReportEndpoint:
    def test_returns_report(self, client: TestClient, report_data):
        login(client, report_data.student.email)

        res = client.get(f"/submissions/{report_data.submission.id}/similarity-report")

        assert res.status_code == 200
        body = res.json()
        assert body["id"] == report_data.document.id
        assert body["similarityScore"] == 50
        assert [d["id"] for d in body["similarDocuments"]] == [
            report_data.source_a.id,
            report_data.source_b.id,
        ]

    def test_not_processed(self, client: TestClient, db: Session, scored_submission):
        data = scored_submission
        data.document.similarity_score = None
        data.document.status = "queued"
        db.commit()
        login(client, data.student.email)

        res = client.get(f"/submissions/{data.submission.id}/similarity-report")

        assert res.status_code == 409
        assert res.json()["detail"] == "Document has not been processed yet"

    def test_processing_failed(
        self, client: TestClient, db: Session, scored_submission
    ):
        data = scored_submission
        data.document.status = "failed"
        db.commit()
        login(client, data.student.email)

        res = client.get(f"/submissions/{data.submission.id}/similarity-report")

        assert res.status_code == 409
        assert res.json()["detail"] == "Document processing failed"

    def test_other_student_forbidden(
        self, client: TestClient, db: Session, scored_submission
    ):
        login(client, create_student(db, email="nosy@test.com").email)

        res = client.get(
            f"/submissions/{scored_submission.submission.id}/similarity-report"
        )

        assert res.status_code == 403

    def test_missing_submission(self, client: TestClient, scored_submission):
        login(client, scored_submission.student.email)

        res = client.get("/submissions/missing-id/similarity-report")

        assert res.status_code == 404


class TestHtmlPreviewEndpoint:
    HTML = '<div data-chunk-id="c1">Hello</div>'

    @pytest.fixture(autouse=True)
    def html_dir(self, tmp_path, monkeypatch: pytest.MonkeyPatch):
        monkeypatch.setattr(Config, "HTML_DIR", tmp_path)
        return tmp_path

    @pytest.fixture
    def preview(self, client: TestClient, db: Session, scored_submission, html_dir):
        """Set the document's status and whether its HTML file exists, then
        fetch the preview as the submitting student."""
        data = scored_submission

        def fetch(status: str, has_html: bool):
            data.document.status = status
            db.commit()
            if has_html:
                (html_dir / f"{data.document.id}.html").write_text(
                    self.HTML, encoding="utf-8"
                )
            login(client, data.student.email)
            return client.get(f"/submissions/{data.submission.id}/html-preview")

        return fetch

    def test_processed(self, preview):
        res = preview("processed", has_html=True)

        assert res.status_code == 200
        assert res.json() == {"htmlContent": self.HTML, "status": "processed"}

    def test_processed_but_html_missing(self, preview):
        res = preview("processed", has_html=False)

        assert res.status_code == 404

    @pytest.mark.parametrize("has_html", [False, True])
    def test_queued_is_processing(self, preview, has_html: bool):
        # A stale file from an earlier run must not be served
        res = preview("queued", has_html=has_html)

        assert res.status_code == 200
        assert res.json() == {"htmlContent": None, "status": "processing"}

    def test_failed_parsing(self, preview):
        res = preview("failed", has_html=False)

        assert res.status_code == 200
        assert res.json() == {"htmlContent": None, "status": "failed"}

    def test_failed_similarity(self, preview):
        # Parsing succeeded, so the preview reports it as processed
        res = preview("failed", has_html=True)

        assert res.status_code == 200
        assert res.json() == {"htmlContent": self.HTML, "status": "processed"}

    def test_other_student_forbidden(
        self, client: TestClient, db: Session, scored_submission
    ):
        login(client, create_student(db, email="nosy@test.com").email)

        res = client.get(f"/submissions/{scored_submission.submission.id}/html-preview")

        assert res.status_code == 403
