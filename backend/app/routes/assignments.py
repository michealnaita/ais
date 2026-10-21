from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app import schemas
from app.repository import AssignmentRepository
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=list[schemas.AssignmentResponse])
def get_assignments(
    assignments_repo: Annotated[AssignmentRepository, Depends(AssignmentRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role == schemas.UserRole.ADMIN:
        return assignments_repo.get_all_assignments()
    if current_user.role == schemas.UserRole.INSTRUCTOR:
        return assignments_repo.get_created_assignments(current_user.id)
    return assignments_repo.get_enrolled_assignments(current_user.id)


@router.post("/", response_model=schemas.AssignmentResponse)
def create_assignment(
    data: schemas.CreateAssignmentInput,
    assignments_repo: Annotated[AssignmentRepository, Depends(AssignmentRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role != schemas.UserRole.INSTRUCTOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    return assignments_repo.create_assignment(data, current_user.id)


@router.post("/{assignment_id}/enroll")
def enroll_in_assignment(
    assignment_id: str,
    data: schemas.EnrollInput,
    assignments_repo: Annotated[AssignmentRepository, Depends(AssignmentRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role != schemas.UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    assignment = assignments_repo.get_assignment(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if data.enrollment_code != assignment.enrollment_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid enrollment code"
        )

    if assignments_repo.is_enrolled(current_user.id, assignment_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Already enrolled"
        )

    assignments_repo.enroll_user(current_user.id, assignment_id)
    return {"message": "Enrolled"}
