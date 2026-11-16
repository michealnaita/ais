from datetime import datetime
from typing import Annotated

from fastapi import Depends
from sqlalchemy import delete, func, select, text, update
from sqlalchemy.orm import Session, aliased

from app import models, schemas
from app.services.database import get_db


def percent(part: int, whole: int) -> int:
    """part/whole as a whole-number percentage, rounded half up (2/3 -> 67)."""
    if whole == 0:
        return 0
    return (200 * part + whole) // (2 * whole)


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

    def get_users_by_email(self, emails: list[str]):
        return (
            self.db.execute(select(models.User).where(models.User.email.in_(emails)))
            .scalars()
            .all()
        )

    def create_users(self, users: list[tuple[schemas.CreateUserInput, str]]):
        """Create every (user input, password hash) pair in one transaction."""
        new_users = [
            models.User(
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                password_hash=password_hash,
                role=user.role,
            )
            for user, password_hash in users
        ]
        self.db.add_all(new_users)
        self.db.commit()
        for new_user in new_users:
            self.db.refresh(new_user)
        return new_users

    def get_all_users(self):
        users = self.db.execute(select(models.User)).scalars().all()
        return users

    def set_user_status(self, user: models.User, status: schemas.UserStatus):
        user.status = status.value
        self.db.commit()
        self.db.refresh(user)
        return user


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
            models.Assignment.deadline,
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
            deadline=assignment.deadline,
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

    def get_enrolled_user_ids(self, assignment_id: str) -> set[str]:
        return set(
            self.db.execute(
                select(models.Enrollment.user_id).where(
                    models.Enrollment.assignment_id == assignment_id
                )
            )
            .scalars()
            .all()
        )

    def get_enrolled_students(self, assignment_id: str):
        return self.db.execute(
            select(
                models.User.id,
                models.User.email,
                models.User.first_name,
                models.User.last_name,
                models.User.role,
                models.User.status,
                models.Enrollment.enrolled_at,
            )
            .join(models.Enrollment.user)
            .where(models.Enrollment.assignment_id == assignment_id)
            .order_by(models.User.last_name, models.User.first_name)
        ).all()

    def enroll_users(self, user_ids: list[str], assignment_id: str):
        self.db.add_all(
            models.Enrollment(user_id=user_id, assignment_id=assignment_id)
            for user_id in user_ids
        )
        self.db.commit()


class SubmissionRepository(Base):
    def _select_submissions(self):
        return (
            select(
                models.Submission.id,
                models.Submission.document_id,
                models.Submission.submitted_at,
                models.Assignment.title.label("assignment_title"),
                models.Document.original_file_name.label("file_name"),
                models.Document.status.label("document_status"),
                models.Document.similarity_score.label("document_similarity"),
                models.Document.size.label("document_size"),
                models.Submission.similarity_threshold,
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

    def get_submission_record(self, submission_id: str):
        return self.db.get(models.Submission, submission_id)

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

    def set_similarity_threshold(self, submission: models.Submission, threshold: int):
        """Change the threshold and send the document back for processing:
        its score and matched chunks were produced under the old threshold."""
        submission.similarity_threshold = threshold
        document = submission.document
        document.status = "queued"
        document.similarity_score = None
        self.db.execute(
            delete(models.SimilarChunk).where(
                models.SimilarChunk.document_id == document.id
            )
        )
        self.db.commit()

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
    def _select_documents(self):
        """Document columns plus the author's name, joined from users. Rows
        from this fit schemas.DocumentResponse."""
        return select(
            models.Document.id,
            models.Document.author_id,
            models.Document.original_file_name,
            models.Document.similarity_score,
            models.Document.status,
            models.Document.size,
            models.Document.mime_type,
            models.Document.uploaded_at,
            models.Document.expires_at,
            (models.User.first_name + " " + models.User.last_name).label(
                "author_name"
            ),
        ).join(models.Document.author)

    def create_document(self, data: schemas.CreateDocumentInput):
        # by_alias=False: model columns are snake_case, not the API's camelCase
        document = models.Document(**data.model_dump(by_alias=False))
        self.db.add(document)
        self.db.commit()
        return self.get_document_with_author(document.id)

    def get_document(self, document_id: str):
        return self.db.get(models.Document, document_id)

    def get_all_documents(self):
        return self.db.execute(
            self._select_documents().order_by(models.Document.uploaded_at.desc())
        ).all()

    def get_document_with_author(self, document_id: str):
        return self.db.execute(
            self._select_documents().where(models.Document.id == document_id)
        ).first()

    def get_similarity_report(self, document_id: str, similarity_threshold: int):
        """The document plus, for every other document it matched, the matched
        passage pairs and a score. Fits schemas.DocumentSimilarityReportResponse.
        None if the document hasn't been scored yet."""
        document = self.get_document_with_author(document_id)
        if document is None or document.similarity_score is None:
            return None

        total_chunks = self._count_chunks(document_id)
        own_chunk = aliased(models.DocumentChunk)
        matched_chunk = aliased(models.DocumentChunk)
        matches = self.db.execute(
            select(
                own_chunk.id.label("own_chunk_id"),
                own_chunk.content.label("own_chunk_content"),
                matched_chunk.id.label("matched_chunk_id"),
                matched_chunk.content.label("matched_chunk_content"),
                models.Document.id.label("source_id"),
                models.Document.original_file_name,
                models.Document.uploaded_at,
                (models.User.first_name + " " + models.User.last_name).label(
                    "author_name"
                ),
            )
            .select_from(models.SimilarChunk)
            .join(own_chunk, own_chunk.id == models.SimilarChunk.document_chunk_id)
            .join(
                matched_chunk, matched_chunk.id == models.SimilarChunk.matched_chunk_id
            )
            .join(models.Document, models.Document.id == matched_chunk.document_id)
            .join(models.Document.author)
            .where(models.SimilarChunk.document_id == document_id)
            .order_by(own_chunk.index, matched_chunk.index)
        ).all()

        sources: dict[str, dict] = {}
        matched_own_chunks: dict[str, set[str]] = {}
        for match in matches:
            source = sources.setdefault(
                match.source_id,
                {
                    "id": match.source_id,
                    "original_file_name": match.original_file_name,
                    "uploaded_year": match.uploaded_at.year,
                    "author_name": match.author_name,
                    "similar_chunks": [],
                },
            )
            source["similar_chunks"].append(
                {
                    "chunk": {
                        "id": match.own_chunk_id,
                        "content": match.own_chunk_content,
                    },
                    "matched_chunk": {
                        "id": match.matched_chunk_id,
                        "content": match.matched_chunk_content,
                    },
                }
            )
            matched_own_chunks.setdefault(match.source_id, set()).add(
                match.own_chunk_id
            )
        # A source's score: share of this document's passages that matched it
        for source_id, source in sources.items():
            source["similarity_score"] = percent(
                len(matched_own_chunks[source_id]), total_chunks
            )

        return {
            **document._mapping,
            "similarity_score": document.similarity_score,
            "similarity_threshold": similarity_threshold,
            "similarity_band": "",  # Not decided yet
            "similar_documents": sorted(
                sources.values(), key=lambda s: s["similarity_score"], reverse=True
            ),
        }

    def _count_chunks(self, document_id: str) -> int:
        return self.db.execute(
            select(func.count(models.DocumentChunk.id)).where(
                models.DocumentChunk.document_id == document_id
            )
        ).scalar_one()

    def persist_documents(self, document_ids: list[str]) -> list[str]:
        """Clear the expiry of the given documents so they are kept. Returns
        the ids that exist (and are now persisted)."""
        found = list(
            self.db.execute(
                select(models.Document.id).where(models.Document.id.in_(document_ids))
            ).scalars()
        )
        if found:
            self.db.execute(
                update(models.Document)
                .where(models.Document.id.in_(found))
                .values(expires_at=None)
            )
            self.db.commit()
        return found

    def get_queued_document_ids(self, document_ids: list[str]) -> list[str]:
        """The given documents that are still waiting to be processed."""
        return list(
            self.db.execute(
                select(models.Document.id).where(
                    models.Document.id.in_(document_ids),
                    models.Document.status == "queued",
                )
            ).scalars()
        )

    def delete_document(self, document_id: str):
        document = self.db.get(models.Document, document_id)
        if document:
            self.db.delete(document)
            self.db.commit()


class SystemLogRepository(Base):
    def log(
        self,
        type: schemas.LogType,
        source: str,
        message: str,
        level: schemas.LogLevel = schemas.LogLevel.INFO,
    ):
        entry = models.SystemLog(
            type=type.value, source=source, message=message, level=level.value
        )
        self.db.add(entry)
        self.db.commit()
        return entry

    def get_all_logs(self):
        return (
            self.db.execute(
                select(models.SystemLog).order_by(models.SystemLog.timestamp.desc())
            )
            .scalars()
            .all()
        )


class DashboardRepository(SubmissionRepository):
    RECENT_LIMIT = 5

    def _count(self, query) -> int:
        return self.db.execute(
            select(func.count()).select_from(query.subquery())
        ).scalar_one()

    # Student
    def get_unsubmitted_assignments(self, user_id: str):
        """Assignments the student is enrolled in but hasn't submitted to."""
        submitted = select(models.Submission.assignment_id).where(
            models.Submission.user_id == user_id
        )
        return (
            self.db.execute(
                select(models.Assignment)
                .join(models.Assignment.enrollments)
                .where(
                    models.Enrollment.user_id == user_id,
                    models.Assignment.id.not_in(submitted),
                )
                .order_by(models.Assignment.deadline)
            )
            .scalars()
            .all()
        )

    def get_recent_user_submissions(self, user_id: str):
        return self.db.execute(
            self._select_submissions()
            .where(models.Submission.user_id == user_id)
            .order_by(models.Submission.submitted_at.desc())
            .limit(self.RECENT_LIMIT)
        ).all()

    def count_user_submissions(self, user_id: str) -> int:
        return self._count(
            select(models.Submission.id).where(models.Submission.user_id == user_id)
        )

    def count_user_enrollments(self, user_id: str) -> int:
        return self._count(
            select(models.Enrollment.id).where(models.Enrollment.user_id == user_id)
        )

    # Instructor
    def _instructor_submissions(self, instructor_id: str):
        return (
            select(models.Submission.id)
            .join(models.Submission.assignment)
            .where(models.Assignment.instructor_id == instructor_id)
        )

    def count_instructor_submissions(self, instructor_id: str) -> int:
        return self._count(self._instructor_submissions(instructor_id))

    def count_flagged_submissions(self, instructor_id: str) -> int:
        return self._count(
            self._instructor_submissions(instructor_id)
            .join(models.Submission.document)
            .where(
                models.Document.similarity_score
                >= models.Submission.similarity_threshold
            )
        )

    def count_instructor_assignments(self, instructor_id: str) -> int:
        return self._count(
            select(models.Assignment.id).where(
                models.Assignment.instructor_id == instructor_id
            )
        )

    def get_recent_logs(self):
        return (
            self.db.execute(
                select(models.SystemLog)
                .order_by(models.SystemLog.timestamp.desc())
                .limit(self.RECENT_LIMIT)
            )
            .scalars()
            .all()
        )

    def get_recent_instructor_submissions(self, instructor_id: str):
        return self.db.execute(
            self._select_submissions()
            .where(models.Assignment.instructor_id == instructor_id)
            .order_by(models.Submission.submitted_at.desc())
            .limit(self.RECENT_LIMIT)
        ).all()

    # Admin
    def count_users_by_role(self) -> dict[str, int]:
        rows = self.db.execute(
            select(models.User.role, func.count()).group_by(models.User.role)
        ).all()
        return dict(rows)

    def get_documents_totals(self) -> tuple[int, int]:
        """(number of documents, total size in bytes)"""
        count, size = self.db.execute(
            select(func.count(), func.coalesce(func.sum(models.Document.size), 0))
        ).one()
        return count, size

    def count_failed_documents(self) -> int:
        return self._count(
            select(models.Document.id).where(models.Document.status == "failed")
        )

    def is_database_connected(self) -> bool:
        try:
            self.db.execute(text("SELECT 1"))
            return True
        except Exception:
            return False
