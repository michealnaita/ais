from app.models import Assignment, Enrollment, Submission
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.fixtures import (
    create_assignment,
    create_assignments,
    create_instructor,
    create_document,
    create_student,
    create_user,
    login,
)


def test_get_student_assignments(client: TestClient, db: Session):
    student = create_student(db)
    other_student = create_student(db, email="other.student@test.com")
    enrolled, _ = create_assignments(
        db, student_id=student.id, instructor_id="instructor-id"
    )
    login(client, email=student.email)

    res = client.get("/assignments")
    assert res.status_code == 200
    assert [a["id"] for a in res.json()] == [enrolled.id]
    assert res.json()[0]["enrollment_count"] is None

    login(client, email=other_student.email)
    res_other = client.get("/assignments")
    assert res_other.status_code == 200
    assert res_other.json() == []


def test_get_instructor_assignments(client: TestClient, db: Session):
    instructor = create_instructor(db)
    assignment = create_assignment(db, instructor_id=instructor.id)
    create_assignment(db, instructor_id="other-instructor")
    for i in range(3):
        student = create_student(db, email=f"student{i}@test.com")
        db.add(Enrollment(user_id=student.id, assignment_id=assignment.id))
        if i < 2:
            document = create_document(db, user_id=student.id)
            db.add(
                Submission(
                    user_id=student.id,
                    assignment_id=assignment.id,
                    document_id=document.id,
                )
            )
    db.commit()

    login(client, email=instructor.email)
    res = client.get("/assignments")

    assert res.status_code == 200
    assert [a["instructor_id"] for a in res.json()] == [instructor.id]
    assert res.json()[0]["enrollment_count"] == 3
    assert res.json()[0]["submission_count"] == 2


def test_get_admin_assignments(client: TestClient, db: Session):
    admin = create_user(db, email="admin@test.com", role="admin")
    create_assignment(db, instructor_id="instructor-a")
    create_assignment(db, instructor_id="instructor-b")
    login(client, email=admin.email)
    res = client.get("/assignments")

    assert res.status_code == 200
    assert len(res.json()) == 2
    assert all(a["enrollment_count"] == 0 for a in res.json())


def test_enroll_student_to_assignment(client: TestClient, db: Session):
    student = create_student(db)
    enrolled = create_assignments(db, student_id="1", instructor_id="1")[0]
    login(client, email=student.email)
    res_wrong_code = client.post(
        f"/assignments/{enrolled.id}/enroll", json={"enrollment_code": "WRONGCODE"}
    )
    assert res_wrong_code.status_code == 400
    assert (
        db.query(Enrollment)
        .filter_by(user_id=student.id, assignment_id=enrolled.id)
        .count()
        == 0
    )

    res_successful = client.post(
        f"/assignments/{enrolled.id}/enroll",
        json={"enrollment_code": enrolled.enrollment_code},
    )
    assert res_successful.status_code == 200
    assert (
        db.query(Enrollment)
        .filter_by(user_id=student.id, assignment_id=enrolled.id)
        .count()
        == 1
    )

    res_already_enrolled = client.post(
        f"/assignments/{enrolled.id}/enroll",
        json={"enrollment_code": enrolled.enrollment_code},
    )
    assert res_already_enrolled.status_code == 409

    res_not_found = client.post(
        "/assignments/missing-id/enroll", json={"enrollment_code": "ABC123"}
    )
    assert res_not_found.status_code == 404


def test_create_assignment(db: Session, client: TestClient):
    instructor = create_instructor(db)
    login(client, email=instructor.email)
    res = client.post(
        "/assignments",
        json={
            "title": "New Assignment",
            "description": "This is a new assignment.",
            "enrollment_code": "NEW123",
        },
    )
    assert res.status_code == 200
    assignment = db.query(Assignment).filter_by(title="New Assignment").first()
    assert assignment is not None
