from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config import Config
from app.services.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    refresh_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now
    )
    enrollments: Mapped[list[Enrollment]] = relationship(back_populates="user")
    documents: Mapped[list[Document]] = relationship(back_populates="author")
    assignments: Mapped[list[Assignment]] = relationship(
        back_populates="instructor",
    )
    submissions: Mapped[list[Submission]] = relationship(back_populates="user")


class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    instructor_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    enrollment_code: Mapped[str] = mapped_column(
        String(10), unique=False, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    deadline: Mapped[datetime] = mapped_column(DateTime, nullable=False)  # UTC
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")
    enrollments: Mapped[list[Enrollment]] = relationship(
        "Enrollment", back_populates="assignment"
    )
    submissions: Mapped[list[Submission]] = relationship(back_populates="assignment")
    instructor: Mapped[User] = relationship(back_populates="assignments")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    assignment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assignments.id"), nullable=False
    )
    enrolled_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    user: Mapped[User] = relationship(back_populates="enrollments")
    assignment: Mapped[Assignment] = relationship(back_populates="enrollments")


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    assignment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assignments.id"), nullable=False
    )
    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("documents.id"), nullable=False
    )
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    # Score (0-100) at or above which the submission is flagged. Starts as the
    # system default and can be changed by the assignment's instructor.
    similarity_threshold: Mapped[int] = mapped_column(
        Integer, nullable=False, default=lambda: Config.FLAG_SIMILARITY_THRESHOLD
    )
    assignment: Mapped[Assignment] = relationship(back_populates="submissions")
    user: Mapped[User] = relationship(back_populates="submissions")
    document: Mapped[Document] = relationship(back_populates="submissions")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    author_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    file_name: Mapped[str] = mapped_column(String(255), unique=False, nullable=False)
    original_file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(50), nullable=False)
    similarity_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="queued")
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    # When the document may be removed. None means it is persisted: it was
    # submitted, or an admin chose to keep it.
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
        default=lambda: datetime.now() + timedelta(days=Config.DOCUMENT_EXPIRY_DAYS),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now
    )
    author: Mapped[User] = relationship(back_populates="documents")
    submissions: Mapped[list[Submission]] = relationship(back_populates="document")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("documents.id"), nullable=False
    )
    index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)


class SimilarChunk(Base):
    __tablename__ = "similar_chunks"

    id = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("documents.id"), nullable=False
    )
    document_chunk_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("document_chunks.id"), nullable=False
    )
    matched_chunk_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("document_chunks.id"), nullable=False
    )


class SystemLog(Base):
    """Audit trail of who did what. Written by the API, never edited."""

    __tablename__ = "system_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )  # UTC
    level: Mapped[str] = mapped_column(String(10), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
