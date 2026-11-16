from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app import schemas
from app.config import Config
from app.repository import (
    AssignmentRepository,
    DocumentRepository,
    SubmissionRepository,
    SystemLogRepository,
)
from app.services.auth import get_current_user
from app.worker.dispatch import queue_documents

router = APIRouter()

NOT_PROCESSED = "Document has not been processed yet"
PROCESSING_FAILED = "Document processing failed"


def get_viewable_submission(
    submission_id: str,
    submissions_repo: SubmissionRepository,
    current_user: schemas.AuthJWTPayload,
):
    """The submission record, if the current user may view it: the student
    who submitted, the assignment's instructor, or an admin."""
    submission = submissions_repo.get_submission_record(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    allowed = (
        current_user.role == schemas.UserRole.ADMIN
        or submission.user_id == current_user.id
        or submission.assignment.instructor_id == current_user.id
    )
    if not allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return submission


def ensure_processing_not_failed(document):
    if document.status == "failed":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=PROCESSING_FAILED)


@router.get("/", response_model=list[schemas.SubmissionResponse])
def get_submissions(
    submissions_repo: Annotated[SubmissionRepository, Depends(SubmissionRepository)],
    assignments_repo: Annotated[AssignmentRepository, Depends(AssignmentRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
    user_id: Annotated[str | None, Query(alias="userId")] = None,
    assignment_id: Annotated[str | None, Query(alias="assignmentId")] = None,
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


@router.get("/{submission_id}", response_model=schemas.SubmissionDetailResponse)
def get_submission(
    submission_id: str,
    submissions_repo: Annotated[SubmissionRepository, Depends(SubmissionRepository)],
    document_repo: Annotated[DocumentRepository, Depends(DocumentRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    """A submission together with its document's similarity report."""
    submission = get_viewable_submission(submission_id, submissions_repo, current_user)

    return {
        **submissions_repo.get_submission(submission_id)._mapping,
        "similarity_report": document_repo.get_similarity_report(
            submission.document_id, submission.similarity_threshold
        ),
    }


@router.get(
    "/{submission_id}/similarity-report",
    response_model=schemas.DocumentSimilarityReportResponse,
)
def get_submission_similarity_report(
    submission_id: str,
    submissions_repo: Annotated[SubmissionRepository, Depends(SubmissionRepository)],
    document_repo: Annotated[DocumentRepository, Depends(DocumentRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    """The similarity report of the submitted document. 409 until the
    document has been scored."""
    submission = get_viewable_submission(submission_id, submissions_repo, current_user)
    ensure_processing_not_failed(submission.document)
    report = document_repo.get_similarity_report(
        submission.document_id, submission.similarity_threshold
    )
    if report is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=NOT_PROCESSED)
    return report


@router.get(
    "/{submission_id}/html-preview",
    response_model=schemas.DocumentHtmlPreviewResponse,
)
def get_submission_html_preview(
    submission_id: str,
    submissions_repo: Annotated[SubmissionRepository, Depends(SubmissionRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    """The submitted document rendered as HTML by the worker. The status
    reflects HTML parsing only, not the similarity check.

    - queued: 200, status "processing", no HTML
    - failed, no HTML file: parsing failed. 200, status "failed", no HTML
    - failed, HTML file present: parsing worked (only similarity failed).
      200, status "processed", with the HTML
    - processed: 200 with the HTML, or 404 if the file is missing
    """
    submission = get_viewable_submission(submission_id, submissions_repo, current_user)
    document = submission.document
    # Check the file first: what a "failed" status means depends on it
    html_path = Config.HTML_DIR / f"{document.id}.html"
    html = html_path.read_text(encoding="utf-8") if html_path.is_file() else None

    if document.status == "failed":
        if html is None:
            return schemas.DocumentHtmlPreviewResponse(
                html_content=None, status="failed"
            )
        return schemas.DocumentHtmlPreviewResponse(html_content=html, status="processed")
    if document.status != "processed":
        # A re-queued document keeps its old file; don't serve stale HTML
        return schemas.DocumentHtmlPreviewResponse(
            html_content=None, status="processing"
        )
    if html is None:
        raise HTTPException(status_code=404, detail="HTML preview not found")
    return schemas.DocumentHtmlPreviewResponse(html_content=html, status="processed")


@router.post("/", response_model=schemas.SubmissionResponse)
def create_submission(
    data: schemas.CreateSubmissionInput,
    submissions_repo: Annotated[SubmissionRepository, Depends(SubmissionRepository)],
    assignments_repo: Annotated[AssignmentRepository, Depends(AssignmentRepository)],
    document_repo: Annotated[DocumentRepository, Depends(DocumentRepository)],
    logs: Annotated[SystemLogRepository, Depends(SystemLogRepository)],
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
    if not document or document.author_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")

    if assignment.status != schemas.AssignmentStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Assignment is closed"
        )

    # A resubmission replaces the student's existing submission and remove the old document from the database and storage
    submission = submissions_repo.get_user_assignment_submission(
        current_user.id, data.assignment_id
    )
    if submission and submission.document_id == data.document_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Document is already submitted to this assignment",
        )
    if submission:
        prev_submitted_document = document_repo.get_document(submission.document_id)
        submission = submissions_repo.replace_submission_document(
            submission, data.document_id
        )
        document_repo.delete_document(prev_submitted_document.id)
        Path(Config.STORAGE_DIR / prev_submitted_document.file_name).unlink(
            missing_ok=True
        )
        log_type, verb = schemas.LogType.SUBMISSION_REPLACED, "resubmitted"
    else:
        submission = submissions_repo.create_submission(data, current_user.id)
        log_type, verb = schemas.LogType.SUBMISSION_CREATED, "submitted"
    # A submitted document is kept for good, so it no longer expires
    document_repo.persist_documents([document.id])
    # Only documents that haven't been processed yet go to the worker
    queue_documents(document_repo.get_queued_document_ids([document.id]))
    logs.log(
        log_type,
        "api.submissions",
        f'{current_user.email} {verb} "{document.original_file_name}" '
        f'to "{assignment.title}"',
    )
    return submissions_repo.get_submission(submission.id)


@router.patch(
    "/{submission_id}/similarity-threshold",
    response_model=schemas.SubmissionResponse,
)
def update_similarity_threshold(
    submission_id: str,
    data: schemas.UpdateSimilarityThresholdInput,
    submissions_repo: Annotated[SubmissionRepository, Depends(SubmissionRepository)],
    logs: Annotated[SystemLogRepository, Depends(SystemLogRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role != schemas.UserRole.INSTRUCTOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    submission = submissions_repo.get_submission_record(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if submission.assignment.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    # Same value: nothing would change, so don't throw away the current results
    previous = submission.similarity_threshold
    if data.similarity_threshold != previous:
        submissions_repo.set_similarity_threshold(submission, data.similarity_threshold)
        queue_documents([submission.document_id])
        logs.log(
            schemas.LogType.SUBMISSION_THRESHOLD_CHANGED,
            "api.submissions",
            f"{current_user.email} changed the similarity threshold of "
            f'"{submission.document.original_file_name}" in '
            f'"{submission.assignment.title}" from {previous} to '
            f"{data.similarity_threshold}; document re-queued",
        )
    return submissions_repo.get_submission(submission_id)
