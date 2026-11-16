from datetime import datetime

import pytest
from app.models import Assignment, Enrollment, Submission
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.fixtures import (
    create_assignment,
    create_assignments,
    create_document,
    create_instructor,
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
    assert res.json()[0]["enrollmentCount"] is None

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
            document = create_document(db, author_id=student.id)
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
    assert [a["instructorId"] for a in res.json()] == [instructor.id]
    assert res.json()[0]["enrollmentCount"] == 3
    assert res.json()[0]["submissionCount"] == 2


def test_get_admin_assignments(client: TestClient, db: Session):
    admin = create_user(db, email="admin@test.com", role="admin")
    create_assignment(db, instructor_id="instructor-a")
    create_assignment(db, instructor_id="instructor-b")
    login(client, email=admin.email)
    res = client.get("/assignments")

    assert res.status_code == 200
    assert len(res.json()) == 2
    assert all(a["enrollmentCount"] == 0 for a in res.json())


class TestGetEnrollments:
    def setup_assignment(self, db: Session):
        instructor = create_instructor(db)
        assignment = create_assignment(db, instructor_id=instructor.id)
        return instructor, assignment

    def test_instructor_gets_enrolled_students(self, client: TestClient, db: Session):
        instructor, assignment = self.setup_assignment(db)
        zoe = create_student(db, email="zoe@test.com", first_name="Zoe", last_name="Adams")
        bob = create_student(db, email="bob@test.com", first_name="Bob", last_name="Brown")
        not_enrolled = create_student(db, email="other@test.com")
        other_assignment = create_assignment(db, instructor_id=instructor.id)
        db.add_all(
            [
                Enrollment(user_id=bob.id, assignment_id=assignment.id),
                Enrollment(user_id=zoe.id, assignment_id=assignment.id),
                Enrollment(user_id=not_enrolled.id, assignment_id=other_assignment.id),
            ]
        )
        db.commit()
        login(client, email=instructor.email)

        res = client.get(f"/assignments/{assignment.id}/enrollments")

        assert res.status_code == 200
        students = res.json()
        # Sorted by last name; only this assignment's students
        assert [s["email"] for s in students] == [zoe.email, bob.email]
        assert set(students[0]) == {
            "id",
            "email",
            "firstName",
            "lastName",
            "role",
            "status",
            "enrolledAt",
        }

    def test_no_enrollments(self, client: TestClient, db: Session):
        instructor, assignment = self.setup_assignment(db)
        login(client, email=instructor.email)

        res = client.get(f"/assignments/{assignment.id}/enrollments")

        assert res.status_code == 200
        assert res.json() == []

    def test_other_instructor_cannot_view(self, client: TestClient, db: Session):
        _, assignment = self.setup_assignment(db)
        other = create_user(db, email="other@test.com", role="instructor")
        login(client, email=other.email)

        res = client.get(f"/assignments/{assignment.id}/enrollments")

        assert res.status_code == 403

    def test_student_cannot_view(self, client: TestClient, db: Session):
        _, assignment = self.setup_assignment(db)
        student = create_student(db, email="s1@test.com")
        db.add(Enrollment(user_id=student.id, assignment_id=assignment.id))
        db.commit()
        login(client, email=student.email)

        res = client.get(f"/assignments/{assignment.id}/enrollments")

        assert res.status_code == 403

    def test_missing_assignment(self, client: TestClient, db: Session):
        instructor = create_instructor(db)
        login(client, email=instructor.email)

        res = client.get("/assignments/missing-id/enrollments")

        assert res.status_code == 404

    def test_unauthenticated(self, client: TestClient, db: Session):
        _, assignment = self.setup_assignment(db)

        res = client.get(f"/assignments/{assignment.id}/enrollments")

        assert res.status_code == 401


class TestEnrollStudents:
    def setup_assignment(self, db: Session):
        instructor = create_instructor(db)
        assignment = create_assignment(db, instructor_id=instructor.id)
        return instructor, assignment

    def enrolled_ids(self, db: Session, assignment_id: str):
        return {
            e.user_id
            for e in db.query(Enrollment).filter_by(assignment_id=assignment_id)
        }

    def test_instructor_enrolls_students_by_email(
        self, client: TestClient, db: Session
    ):
        instructor, assignment = self.setup_assignment(db)
        s1 = create_student(db, email="s1@test.com")
        s2 = create_student(db, email="s2@test.com")
        login(client, email=instructor.email)

        res = client.post(
            f"/assignments/{assignment.id}/enroll",
            json={"emails": [s1.email, s2.email]},
        )

        assert res.status_code == 200
        assert res.json() == {
            "enrolled": [s1.email, s2.email],
            "alreadyEnrolled": [],
        }
        assert self.enrolled_ids(db, assignment.id) == {s1.id, s2.id}

    def test_already_enrolled_students_are_skipped(
        self, client: TestClient, db: Session
    ):
        instructor, assignment = self.setup_assignment(db)
        s1 = create_student(db, email="s1@test.com")
        s2 = create_student(db, email="s2@test.com")
        login(client, email=instructor.email)
        client.post(f"/assignments/{assignment.id}/enroll", json={"emails": [s1.email]})

        res = client.post(
            f"/assignments/{assignment.id}/enroll",
            json={"emails": [s1.email, s2.email, s2.email]},
        )

        assert res.status_code == 200
        assert res.json() == {
            "enrolled": [s2.email],
            "alreadyEnrolled": [s1.email],
        }
        assert db.query(Enrollment).filter_by(assignment_id=assignment.id).count() == 2

    def test_unknown_or_non_student_email_fails(self, client: TestClient, db: Session):
        instructor, assignment = self.setup_assignment(db)
        student = create_student(db, email="s1@test.com")
        create_user(db, email="admin@test.com", role="admin")
        login(client, email=instructor.email)

        res = client.post(
            f"/assignments/{assignment.id}/enroll",
            json={"emails": [student.email, "ghost@test.com", "admin@test.com"]},
        )

        assert res.status_code == 400
        assert res.json()["detail"]["emails"] == ["ghost@test.com", "admin@test.com"]
        assert self.enrolled_ids(db, assignment.id) == set()

    def test_instructor_cannot_enroll_into_others_assignment(
        self, client: TestClient, db: Session
    ):
        _, assignment = self.setup_assignment(db)
        other = create_user(db, email="other@test.com", role="instructor")
        student = create_student(db, email="s1@test.com")
        login(client, email=other.email)

        res = client.post(
            f"/assignments/{assignment.id}/enroll", json={"emails": [student.email]}
        )

        assert res.status_code == 403
        assert self.enrolled_ids(db, assignment.id) == set()

    def test_missing_assignment(self, client: TestClient, db: Session):
        instructor = create_instructor(db)
        login(client, email=instructor.email)

        res = client.post(
            "/assignments/missing-id/enroll", json={"emails": ["s1@test.com"]}
        )

        assert res.status_code == 404


def test_create_assignment(db: Session, client: TestClient):
    instructor = create_instructor(db)
    login(client, email=instructor.email)
    res = client.post(
        "/assignments",
        json={
            "title": "New Assignment",
            "description": "This is a new assignment.",
            "enrollmentCode": "NEW123",
            # Sent in UTC+3; stored and returned in UTC
            "deadline": "2099-06-01T12:00:00+03:00",
        },
    )
    assert res.status_code == 200
    assert res.json()["deadline"] == "2099-06-01T09:00:00"
    assignment = db.query(Assignment).filter_by(title="New Assignment").first()
    assert assignment is not None
    assert assignment.deadline == datetime(2099, 6, 1, 9, 0)


@pytest.mark.parametrize("deadline", ["2000-01-01T00:00:00Z", None])
def test_create_assignment_requires_future_deadline(
    db: Session, client: TestClient, deadline
):
    instructor = create_instructor(db)
    login(client, email=instructor.email)
    body = {"title": "Late", "enrollmentCode": "NEW123"}
    if deadline:
        body["deadline"] = deadline

    res = client.post("/assignments", json=body)

    assert res.status_code == 422
    assert db.query(Assignment).filter_by(title="Late").count() == 0
