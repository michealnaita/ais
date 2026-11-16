from datetime import datetime, timedelta, timezone
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base for every API schema: camelCase on the wire, snake_case in Python.

    Requests may send camelCase (the frontend) or snake_case; Python code builds
    schemas with snake_case kwargs; responses always go out in camelCase."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
        serialize_by_alias=True,
        from_attributes=True,
    )


# User schemas
class UserRole(str, Enum):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"


class UserStatus(str, Enum):
    ACTIVE = "active"
    DEACTIVATED = "deactivated"


class UserBase(CamelModel):
    email: EmailStr
    first_name: str
    last_name: str


class CreateUserInput(UserBase):
    role: UserRole
    password: str


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    role: UserRole
    status: UserStatus


# Auth Schemas
class LoginInput(CamelModel):
    email: EmailStr
    password: str


class AuthJWTPayload(CamelModel):
    """Claims carried by the short-lived session token."""

    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole


# Document Schemas
class CreateDocumentInput(CamelModel):
    file_name: str
    original_file_name: str
    size: int
    mime_type: str
    author_id: str


class DocumentResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    original_file_name: str
    similarity_score: int | None
    status: str
    size: int
    mime_type: str
    uploaded_at: datetime
    # None once the document is persisted
    expires_at: datetime | None
    author_name: str
    author_id: str


class PersistDocumentsInput(CamelModel):
    document_ids: list[str] = Field(min_length=1)


class PersistDocumentsResponse(CamelModel):
    persisted_ids: list[str]
    not_found_ids: list[str]
    # Persisted documents that were still queued and got sent to the worker
    queued_ids: list[str]


class DocumentChunk(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    content: str


class DocumentChunkResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    chunk: DocumentChunk
    matched_chunk: DocumentChunk


# Document Similarity Report schemas
class SimilarDocumentResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    original_file_name: str
    uploaded_year: int
    author_name: str
    similarity_score: int
    similar_chunks: list[DocumentChunkResponse]


class DocumentSimilarityReportResponse(DocumentResponse):
    model_config = ConfigDict(from_attributes=True)
    similarity_score: int
    similarity_threshold: int
    similarity_band: str
    similar_documents: list[SimilarDocumentResponse]


class DocumentHtmlPreviewResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    html_content: str | None
    status: str


# Assignment Schemas
class AssignmentStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"


class AssignmentResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str | None
    status: str
    created_at: datetime
    deadline: datetime  # UTC
    enrollment_code: str
    instructor_id: str
    # Only populated for instructors and admins
    enrollment_count: int | None = None
    submission_count: int | None = None


class CreateAssignmentInput(CamelModel):
    title: str
    description: str | None = None
    enrollment_code: str
    deadline: datetime

    @field_validator("deadline")
    @classmethod
    def deadline_in_future_utc(cls, value: datetime) -> datetime:
        """Store as naive UTC. A deadline without a timezone is taken as UTC."""
        if value.tzinfo is not None:
            value = value.astimezone(timezone.utc).replace(tzinfo=None)
        if value <= datetime.now(timezone.utc).replace(tzinfo=None):
            raise ValueError("Deadline must be in the future")
        return value


class EnrollInput(CamelModel):
    emails: list[EmailStr] = Field(min_length=1)


class EnrolledStudentResponse(UserResponse):
    enrolled_at: datetime


class EnrollResponse(CamelModel):
    enrolled: list[EmailStr]
    already_enrolled: list[EmailStr]


# Submission Schemas
class SubmissionResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    document_id: str
    file_name: str
    assignment_title: str
    submitted_at: datetime
    document_status: str
    document_similarity: int | None
    document_size: int
    submitted_by: str
    similarity_threshold: int


class SubmissionDetailResponse(SubmissionResponse):
    # None until the document has been processed (no similarity score yet)
    similarity_report: DocumentSimilarityReportResponse | None


class CreateSubmissionInput(CamelModel):
    assignment_id: str
    document_id: str


class UpdateSimilarityThresholdInput(CamelModel):
    similarity_threshold: int = Field(ge=0, le=100)


# System Logs
class LogLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class LogType(str, Enum):
    """Audited events, as "<entity>.<action>"."""

    LOGIN = "auth.login"
    LOGIN_FAILED = "auth.login_failed"
    USERS_CREATED = "user.created"
    USER_DEACTIVATED = "user.deactivated"
    ASSIGNMENT_CREATED = "assignment.created"
    STUDENTS_ENROLLED = "assignment.enrolled"
    DOCUMENT_UPLOADED = "document.uploaded"
    DOCUMENTS_PERSISTED = "document.persisted"
    SUBMISSION_CREATED = "submission.created"
    SUBMISSION_REPLACED = "submission.replaced"
    SUBMISSION_THRESHOLD_CHANGED = "submission.threshold_changed"


class SystemLogResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    timestamp: datetime
    level: str
    message: str
    type: str
    source: str


# Dashboard Schemas
class StudentDashboardResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    upcoming_assignments: list[AssignmentResponse]  # future and missed deadlines
    submission_history: list[SubmissionResponse]  # up to 5 submissions
    submission_count: int
    assignment_count: int


class InstructorDashboardResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    flagged_submission_count: int
    submission_count: int
    assignment_count: int
    recent_submissions: list[SubmissionResponse]  # up to 5 submissions


class UsersBreakdown(CamelModel):
    count: int
    students: int
    instructors: int
    admins: int


class DocumentsBreakdown(CamelModel):
    count: int
    size: int


class SystemHealthResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    database_status: str  # "running" or "stopped" or None if unknown
    worker_status: str  # "running" or "stopped" or None if unknown
    server_status: str  # "running" or "stopped" or None if unknown


class AdminDashboardResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    users: UsersBreakdown
    documents: DocumentsBreakdown
    system_health: SystemHealthResponse
    failed_job_count: int
    recent_activity: list[SystemLogResponse]  # up to 5 latest audit log entries
