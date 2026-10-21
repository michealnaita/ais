from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app import schemas
from app.config import Config
from app.repository import (
    AssignmentRepository,
    DocumentRepository,
    SubmissionRepository,
)
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=list[schemas.SubmissionResponse])
def get_submissions(
    submissions_repo: Annotated[SubmissionRepository, Depends(SubmissionRepository)],
    assignments_repo: Annotated[AssignmentRepository, Depends(AssignmentRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
    user_id: str | None = None,
    assignment_id: str | None = None,
):
    is_admin = current_user.role == schemas.UserRole.ADMIN

    if assignment_id is not None:
        assignment = assignments_repo.get_assignment(assignment_id)
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        if not is_admin and assignment.instructor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden"
            )
        return submissions_repo.get_assignment_submissions(assignment_id)

    user_id = user_id or current_user.id
    if not is_admin and user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return submissions_repo.get_user_submissions(user_id)


@router.post("/", response_model=schemas.SubmissionResponse)
def create_submission(
    data: schemas.CreateSubmissionInput,
    submissions_repo: Annotated[SubmissionRepository, Depends(SubmissionRepository)],
    assignments_repo: Annotated[AssignmentRepository, Depends(AssignmentRepository)],
    document_repo: Annotated[DocumentRepository, Depends(DocumentRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    assignment = assignments_repo.get_assignment(data.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if not assignments_repo.is_enrolled(current_user.id, data.assignment_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enrolled in assignment"
        )

    document = document_repo.get_document(data.document_id)
    # If document is missing or belongs to other user then raise 404 error
    if not document or document.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")

    if assignment.status != schemas.AssignmentStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Assignment is closed"
        )

    # A resubmission replaces the student's existing submission and remove the old document from the database and storage
    submission = submissions_repo.get_user_assignment_submission(
        current_user.id, data.assignment_id
    )
    if submission:
        prev_submitted_document = document_repo.get_document(submission.document_id)
        submission = submissions_repo.replace_submission_document(
            submission, data.document_id
        )
        document_repo.delete_document(prev_submitted_document)
        Path(Config.STORAGE_DIR / prev_submitted_document.file_name).unlink(
            missing_ok=True
        )

    else:
        submission = submissions_repo.create_submission(data, current_user.id)
    return submissions_repo.get_submission(submission.id)
