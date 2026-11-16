from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app import schemas
from app.repository import AssignmentRepository, SystemLogRepository, UserRepository
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
    logs: Annotated[SystemLogRepository, Depends(SystemLogRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role != schemas.UserRole.INSTRUCTOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    assignment = assignments_repo.create_assignment(data, current_user.id)
    logs.log(
        schemas.LogType.ASSIGNMENT_CREATED,
        "api.assignments",
        f"{current_user.email} created assignment \"{assignment.title}\"",
    )
    return assignment


@router.get(
    "/{assignment_id}/enrollments",
    response_model=list[schemas.EnrolledStudentResponse],
)
def get_assignment_enrollments(
    assignment_id: str,
    assignments_repo: Annotated[AssignmentRepository, Depends(AssignmentRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role != schemas.UserRole.INSTRUCTOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    assignment = assignments_repo.get_assignment(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    return assignments_repo.get_enrolled_students(assignment_id)


@router.post("/{assignment_id}/enroll", response_model=schemas.EnrollResponse)
def enroll_students(
    assignment_id: str,
    data: schemas.EnrollInput,
    assignments_repo: Annotated[AssignmentRepository, Depends(AssignmentRepository)],
    user_repo: Annotated[UserRepository, Depends(UserRepository)],
    logs: Annotated[SystemLogRepository, Depends(SystemLogRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role != schemas.UserRole.INSTRUCTOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    assignment = assignments_repo.get_assignment(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    emails = list(dict.fromkeys(data.emails))
    students = {
        user.email: user
        for user in user_repo.get_users_by_email(emails)
        if user.role == schemas.UserRole.STUDENT
    }
    # All or nothing: a typo shouldn't leave the class half enrolled
    invalid = [email for email in emails if email not in students]
    if invalid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "No student account for these emails", "emails": invalid},
        )

    already_ids = assignments_repo.get_enrolled_user_ids(assignment_id)
    to_enroll = [email for email in emails if students[email].id not in already_ids]
    assignments_repo.enroll_users([students[e].id for e in to_enroll], assignment_id)
    if to_enroll:
        logs.log(
            schemas.LogType.STUDENTS_ENROLLED,
            "api.assignments",
            f"{current_user.email} enrolled {len(to_enroll)} student(s) in "
            f"\"{assignment.title}\": {', '.join(to_enroll)}",
        )
    return {
        "enrolled": to_enroll,
        "already_enrolled": [e for e in emails if e not in to_enroll],
    }
