from datetime import datetime
from typing import Annotated

from fastapi import Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models, schemas
from app.services.database import get_db


class Base:
    def __init__(self, db: Annotated[Session, Depends(get_db)]):
        self.db = db


class UserRepository(Base):
    def get_user(self, user_id: str):
        user = (
            self.db.execute(select(models.User).where(models.User.id == user_id))
            .scalars()
            .first()
        )
        return user

    def create_user(self, user: schemas.CreateUserInput, password_hash: str):
        new_user = models.User(
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            password_hash=password_hash,
            role=user.role,
        )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user

    def get_all_users(self):
        users = self.db.execute(select(models.User)).scalars().all()
        return users


class AssignmentRepository(Base):
    def get_assignment(self, assignment_id: str):
        return self.db.get(models.Assignment, assignment_id)

    def _select_assignments_with_counts(self):
        # Correlated subqueries rather than joins: joining both enrollments and
        # submissions would multiply rows and inflate the counts
        enrollment_count = (
            select(func.count(models.Enrollment.id))
            .where(models.Enrollment.assignment_id == models.Assignment.id)
            .scalar_subquery()
        )
        submission_count = (
            select(func.count(models.Submission.id))
            .where(models.Submission.assignment_id == models.Assignment.id)
            .scalar_subquery()
        )
        return select(
            models.Assignment.id,
            models.Assignment.instructor_id,
            models.Assignment.title,
            models.Assignment.description,
            models.Assignment.status,
            models.Assignment.created_at,
            models.Assignment.enrollment_code,
            enrollment_count.label("enrollment_count"),
            submission_count.label("submission_count"),
        )

    def get_all_assignments(self):
        return self.db.execute(self._select_assignments_with_counts()).all()

    def get_enrolled_assignments(self, user_id: str):
        return (
            self.db.execute(
                select(models.Assignment)
                .join(
                    models.Assignment.enrollments,
                )
                .where(models.Enrollment.user_id == user_id)
            )
            .scalars()
            .all()
        )

    def get_created_assignments(self, user_id: str):
        return self.db.execute(
            self._select_assignments_with_counts().where(
                models.Assignment.instructor_id == user_id
            )
        ).all()

    def create_assignment(
        self, assignment: schemas.CreateAssignmentInput, user_id: str
    ):
        new_assignment = models.Assignment(
            instructor_id=user_id,
            title=assignment.title,
            description=assignment.description,
            enrollment_code=assignment.enrollment_code,
        )
        self.db.add(new_assignment)
        self.db.commit()
        self.db.refresh(new_assignment)
        return new_assignment

    def is_enrolled(self, user_id: str, assignment_id: str) -> bool:
        enrollment = self.db.execute(
            select(models.Enrollment.id).where(
                models.Enrollment.user_id == user_id,
                models.Enrollment.assignment_id == assignment_id,
            )
        ).first()
        return enrollment is not None

    def enroll_user(self, user_id: str, assignment_id: str):
        enrollment = models.Enrollment(user_id=user_id, assignment_id=assignment_id)
        self.db.add(enrollment)
        self.db.commit()
        self.db.refresh(enrollment)
        return enrollment


class SubmissionRepository(Base):
    def _select_submissions(self):
        return (
            select(
                models.Submission.id,
                models.Submission.submitted_at,
                models.Assignment.title.label("assignment_title"),
                models.Document.original_file_name.label("file_name"),
                models.Document.status.label("document_status"),
                models.Document.similarity_score.label("document_similarity"),
                models.Document.size.label("document_size"),
                (models.User.first_name + " " + models.User.last_name).label(
                    "submitted_by"
                ),
            )
            .join(
                models.Submission.assignment,
            )
            .join(models.Submission.document)
            .join(models.Submission.user)
        )

    def get_submission(self, submission_id: str):
        return self.db.execute(
            self._select_submissions().where(models.Submission.id == submission_id)
        ).first()

    def get_assignment_submissions(self, assignment_id: str):
        return self.db.execute(
            self._select_submissions().where(models.Assignment.id == assignment_id)
        ).all()

    def get_user_submissions(self, user_id: str):
        return self.db.execute(
            self._select_submissions().where(models.User.id == user_id)
        ).all()

    def get_user_assignment_submission(self, user_id: str, assignment_id: str):
        return (
            self.db.execute(
                select(models.Submission).where(
                    models.Submission.user_id == user_id,
                    models.Submission.assignment_id == assignment_id,
                )
            )
            .scalars()
            .first()
        )

    def replace_submission_document(
        self, submission: models.Submission, document_id: str
    ):
        submission.document_id = document_id
        submission.submitted_at = datetime.now()
        self.db.commit()
        self.db.refresh(submission)
        return submission

    def create_submission(self, data: schemas.CreateSubmissionInput, user_id: str):
        submission = models.Submission(
            user_id=user_id,
            assignment_id=data.assignment_id,
            document_id=data.document_id,
        )
        self.db.add(submission)
        self.db.commit()
        self.db.refresh(submission)
        return submission


class DocumentRepository(Base):
    def create_document(self, data: schemas.CreateDocumentInput):
        document = models.Document(**data.model_dump())
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def get_document(self, document_id: str):
        return self.db.get(models.Document, document_id)

    def delete_document(self, document_id: str):
        document = self.db.get(models.Document, document_id)
        if document:
            self.db.delete(document)
            self.db.commit()
