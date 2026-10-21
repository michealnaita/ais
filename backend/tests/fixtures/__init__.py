from datetime import datetime, timezone

from app.models import (
    Assignment,
    Document,
    DocumentChunk,
    Enrollment,
    SimilarChunk,
    Submission,
    User,
)
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.mocks import (
    DEFAULT_PASSWORD,
    create_assignment_record,
    create_document_chunk_record,
    create_document_record,
    create_similar_chunk_record,
    create_user_record,
)


def login(client: TestClient, email: str, password: str = DEFAULT_PASSWORD):
    client.post("/auth/login", json={"email": email, "password": password})


def create_user(db: Session, **overrides):
    user = User(**create_user_record(**overrides))
    db.add(user)
    db.commit()
    return user


def create_student(db: Session, **overrides):
    return create_user(db, **overrides, role="student")


def create_instructor(db: Session):
    return create_user(db, email="instructor@test.com", role="instructor")


def create_assignment(db: Session, instructor_id: str = "placeholder-instructor"):
    assignment = Assignment(**create_assignment_record(instructor_id=instructor_id))
    db.add(assignment)
    db.commit()
    return assignment


def create_enrollment(
    db: Session, student_id: str, instructor_id: str = "placeholder-instructor"
):
    assignment = create_assignment(db, instructor_id=instructor_id)
    enrollment = Enrollment(user_id=student_id, assignment_id=assignment.id)
    db.add(enrollment)
    db.commit()
    return enrollment


def create_assignments(db: Session, student_id: str, instructor_id: str):
    enrolled = Assignment(**create_assignment_record())
    other = Assignment(
        **create_assignment_record(
            title="Other", enrollment_code="XYZ789", instructor_id=instructor_id
        )
    )
    db.add_all([enrolled, other])
    db.flush()
    db.add(Enrollment(user_id=student_id, assignment_id=enrolled.id))
    db.commit()
    return enrolled, other


def create_document(db: Session, user_id: str, **overrides):
    document = Document(**create_document_record(user_id=user_id, **overrides))
    db.add(document)
    db.commit()
    return document


def create_user_submissions(db: Session, user_id: str):
    assignment = Assignment(**create_assignment_record())
    db.add(assignment)
    db.flush()
    enrollment = Enrollment(user_id=user_id, assignment_id=assignment.id)
    document = Document(**create_document_record(user_id))
    db.add_all([document, enrollment])
    db.flush()
    submission = Submission(
        user_id=user_id,
        assignment_id=assignment.id,
        document_id=document.id,
        submitted_at=datetime.now(timezone.utc),
    )
    db.add(submission)
    db.commit()
    return submission


def create_assignment_submissions(db: Session, assignment_id: str):
    student_id = create_student(db, email="submitter@test.com").id
    enrollment = Enrollment(user_id=student_id, assignment_id=assignment_id)
    document = Document(**create_document_record(student_id))
    db.add_all([document, enrollment])
    db.flush()
    submission = Submission(
        user_id=student_id,
        assignment_id=assignment_id,
        document_id=document.id,
        submitted_at=datetime.now(timezone.utc),
    )
    db.add(submission)
    db.commit()
    return submission


def create_document_similarity_report(
    db: Session,
    user_id: str,
    document_id: str,
    instructor_id: str = "instructor-placeholder",
):
    # create document chunk and similar chunk
    chunk = DocumentChunk(**create_document_chunk_record(document_id))
    other_document = Document(**create_document_record("other-student-id"))
    db.add_all([chunk, other_document])
    db.flush()
    other_chunk = DocumentChunk(**create_document_chunk_record(other_document.id))
    db.add(other_chunk)
    db.flush()
    similar_chunk = SimilarChunk(
        **create_similar_chunk_record(document_id, chunk.id, other_chunk.id)
    )
    db.add(similar_chunk)
    db.flush()

    # ------------------------------

    # create assignment and enroll student to it
    enrollment = create_enrollment(db, student_id=user_id, instructor_id=instructor_id)
    # create submission
    submission = Submission(
        user_id=user_id,
        assignment_id=enrollment.assignment_id,
        document_id=document_id,
    )
    db.add(submission)
    db.commit()

    return enrollment.assignment_id
