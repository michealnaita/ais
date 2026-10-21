from datetime import datetime, timedelta, timezone
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# User schemas
class UserRole(str, Enum):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str


class CreateUserInput(UserBase):
    role: UserRole
    password: str


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


# Auth Schemas
class LoginInput(BaseModel):
    email: EmailStr
    password: str


class AuthJWTPayload(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    exp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(hours=24)
    )


# Document Schemas
class CreateDocumentInput(BaseModel):
    file_name: str
    original_file_name: str
    size: int
    mime_type: str
    user_id: str


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    original_file_name: str
    similarity_score: int | None
    status: str
    size: int
    mime_type: str
    uploaded_at: datetime


class DocumentChunkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    document_id: str
    content: str
    index: int


class DocumentSimilarityReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    similarity_score: int
    similar_chunks: list[DocumentChunkResponse]
    document_chunks: list[DocumentChunkResponse]
    document: DocumentResponse
    similar_documents: list[DocumentResponse]


# Assignment Schemas
class AssignmentStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"


class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str | None
    status: str
    created_at: datetime
    enrollment_code: str
    instructor_id: str
    # Only populated for instructors and admins
    enrollment_count: int | None = None
    submission_count: int | None = None


class CreateAssignmentInput(BaseModel):
    title: str
    description: str | None = None
    enrollment_code: str


class EnrollInput(BaseModel):
    enrollment_code: str


# Submission Schemas
class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    file_name: str
    assignment_title: str
    submitted_at: datetime
    document_status: str
    document_similarity: int | None
    document_size: int
    submitted_by: str


class CreateSubmissionInput(BaseModel):
    assignment_id: str
    document_id: str
