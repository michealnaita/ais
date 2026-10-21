from app.models import Submission
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.fixtures import (
    create_assignment,
    create_assignment_submissions,
    create_document,
    create_enrollment,
    create_instructor,
    create_student,
    create_user_submissions,
    login,
)


def test_create_submission(db: Session, client: TestClient):
    student = create_student(db)
    document = create_document(db, user_id=student.id)
    assignment = create_enrollment(db, student_id=student.id).assignment
    not_enrolled_assignment = create_assignment(db)
    login(client, student.email)
    res_success = client.post(
        "/submissions",
        json={
            "assignment_id": assignment.id,
            "document_id": document.id,
        },
    )
    assert res_success.status_code == 200
    assert res_success.json()["file_name"] == document.original_file_name

    res_not_enrolled = client.post(
        "/submissions",
        json={
            "assignment_id": not_enrolled_assignment.id,
            "document_id": document.id,
        },
    )
    assert res_not_enrolled.status_code == 403

    res_assignment_not_found = client.post(
        "/submissions",
        json={
            "assignment_id": "missing-assignment-id",
            "document_id": document.id,
        },
    )
    assert res_assignment_not_found.status_code == 404

    other_student = create_student(db, email="other-student@test.com")
    other_document = create_document(db, user_id=other_student.id)
    res_other_users_document = client.post(
        "/submissions",
        json={
            "assignment_id": assignment.id,
            "document_id": other_document.id,
        },
    )
    assert res_other_users_document.status_code == 404


def test_resubmission_replaces_previous_submission(db: Session, client: TestClient):
    student = create_student(db)
    first_document = create_document(db, user_id=student.id)
    second_document = create_document(
        db, user_id=student.id, original_file_name="second.pdf"
    )
    assignment = create_enrollment(db, student_id=student.id).assignment
    login(client, student.email)

    res_first = client.post(
        "/submissions",
        json={"assignment_id": assignment.id, "document_id": first_document.id},
    )
    res_second = client.post(
        "/submissions",
        json={"assignment_id": assignment.id, "document_id": second_document.id},
    )
    assert res_first.status_code == 200
    assert res_second.status_code == 200
    assert res_second.json()["id"] == res_first.json()["id"]

    submissions = db.query(Submission).filter_by(user_id=student.id).all()
    assert len(submissions) == 1
    assert submissions[0].document_id == second_document.id


def test_cannot_submit_to_closed_assignment(db: Session, client: TestClient):
    student = create_student(db)
    first_document = create_document(db, user_id=student.id)
    second_document = create_document(db, user_id=student.id)
    assignment = create_enrollment(db, student_id=student.id).assignment
    login(client, student.email)

    res_first = client.post(
        "/submissions",
        json={"assignment_id": assignment.id, "document_id": first_document.id},
    )
    assert res_first.status_code == 200

    assignment.status = "closed"
    db.commit()

    res_resubmit = client.post(
        "/submissions",
        json={"assignment_id": assignment.id, "document_id": second_document.id},
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
        "/submissions", params={"user_id": other_student.id}
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
            "assignment_id": assignment.id,
        },
    )
    assert res.status_code == 200
    assert len(res.json()) == 1

    res_other_assignment = client.get(
        "/submissions",
        params={
            "assignment_id": other_assignment.id,
        },
    )
    assert res_other_assignment.status_code == 200
    assert res_other_assignment.json() == []

    student = create_student(db, email="nosy-student@test.com")
    login(client, student.email)
    res_student = client.get("/submissions", params={"assignment_id": assignment.id})
    assert res_student.status_code == 403
