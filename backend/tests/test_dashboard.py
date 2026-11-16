from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest
from app.config import Config
from app.models import Enrollment, Submission, SystemLog
from app.worker import status as worker_status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.fixtures import (
    create_assignment,
    create_document,
    create_instructor,
    create_student,
    create_user,
    login,
)


def submit(db: Session, student_id: str, assignment_id: str, **document_fields):
    document = create_document(db, author_id=student_id, **document_fields)
    db.add(
        Submission(
            user_id=student_id, assignment_id=assignment_id, document_id=document.id
        )
    )
    db.commit()


def enroll(db: Session, student_id: str, *assignments):
    db.add_all(Enrollment(user_id=student_id, assignment_id=a.id) for a in assignments)
    db.commit()


@pytest.fixture
def student_dashboard_data(db: Session):
    """A student enrolled in three assignments: one submitted, one due in the
    future and one whose deadline has passed."""
    student = create_student(db)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    submitted = create_assignment(db)
    due_later = create_assignment(db, deadline=now + timedelta(days=9))
    missed = create_assignment(db, deadline=now - timedelta(days=1))
    enroll(db, student.id, submitted, due_later, missed)
    submit(db, student.id, submitted.id)
    return SimpleNamespace(student=student, due_later=due_later, missed=missed)


@pytest.fixture
def instructor_dashboard_data(db: Session):
    """An instructor with one assignment and two submissions to it, one of them
    flagged, plus a flagged submission to another instructor's assignment."""
    instructor = create_instructor(db)
    assignment = create_assignment(db, instructor_id=instructor.id)
    other_assignment = create_assignment(db, instructor_id="someone-else")
    s1 = create_student(db, email="s1@test.com")
    s2 = create_student(db, email="s2@test.com")
    submit(db, s1.id, assignment.id, similarity_score=Config.FLAG_SIMILARITY_THRESHOLD)
    submit(db, s2.id, assignment.id, similarity_score=5)
    submit(db, s1.id, other_assignment.id, similarity_score=90)
    return SimpleNamespace(instructor=instructor)


@pytest.fixture
def admin_dashboard_data(
    db: Session, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
):
    """One user of each role, 3,500 bytes of documents (one failed), a
    10,000 byte storage quota and six earlier audit log entries."""
    monkeypatch.setattr(Config, "STORAGE_DIR", tmp_path)
    monkeypatch.setattr(Config, "MAX_STORAGE_SIZE", 10_000)
    monkeypatch.setattr(worker_status, "get_worker_status", lambda: "running")
    admin = create_user(db, role="admin", email="admin@test.com")
    create_instructor(db)
    student = create_student(db, email="s1@test.com")
    create_document(db, author_id=student.id, size=1_000)
    create_document(db, author_id=student.id, size=2_500, status="failed")
    start = datetime(2026, 1, 1)
    earlier_logs = [
        SystemLog(
            timestamp=start + timedelta(minutes=i),
            level="info",
            type="document.uploaded",
            source="api.documents",
            message=f"upload {i}",
        )
        for i in range(6)
    ]
    db.add_all(earlier_logs)
    db.commit()
    return SimpleNamespace(admin=admin, earlier_logs=earlier_logs)


def test_student_dashboard(client: TestClient, student_dashboard_data):
    data = student_dashboard_data
    login(client, data.student.email)

    res = client.get("/dashboard/").json()

    # Unsubmitted ones, missed and future, soonest deadline first
    assert [a["id"] for a in res["upcomingAssignments"]] == [
        data.missed.id,
        data.due_later.id,
    ]
    assert len(res["submissionHistory"]) == 1
    assert res["submissionCount"] == 1
    assert res["assignmentCount"] == 3


def test_instructor_dashboard(client: TestClient, instructor_dashboard_data):
    login(client, instructor_dashboard_data.instructor.email)

    res = client.get("/dashboard/").json()

    assert res["assignmentCount"] == 1
    assert res["submissionCount"] == 2
    assert res["flaggedSubmissionCount"] == 1
    assert len(res["recentSubmissions"]) == 2


def test_admin_dashboard(client: TestClient, admin_dashboard_data):
    login(client, admin_dashboard_data.admin.email)

    res = client.get("/dashboard/").json()

    assert res["users"] == {"count": 3, "students": 1, "instructors": 1, "admins": 1}
    assert res["documents"] == {"count": 2, "size": 3_500}
    assert res["systemHealth"] == {
        "databaseStatus": "running",
        "workerStatus": "running",
        "serverStatus": "running",
    }
    assert res["failedJobCount"] == 1
    # The 5 newest entries: the admin's own login, then the latest 4 earlier ones
    assert [e["message"] for e in res["recentActivity"]] == [
        f"{admin_dashboard_data.admin.email} logged in",
        "upload 5",
        "upload 4",
        "upload 3",
        "upload 2",
    ]
