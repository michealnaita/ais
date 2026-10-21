from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app import schemas, utils
from app.repository import AssignmentRepository, UserRepository
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/{user_id}/assignments", response_model=list[schemas.AssignmentResponse])
def get_user_assignments(
    user_id: str,
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
    assignments_repo: Annotated[AssignmentRepository, Depends(AssignmentRepository)],
):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if current_user.role == schemas.UserRole.INSTRUCTOR:
        return assignments_repo.get_created_assignments(user_id)
    return assignments_repo.get_enrolled_assignments(user_id)


@router.get("/{user_id}/submissions", response_model=list[schemas.SubmissionResponse])
@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: str,
    user_repo: Annotated[UserRepository, Depends(UserRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    user = user_repo.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post(
    "/", status_code=status.HTTP_201_CREATED, response_model=schemas.UserResponse
)
def create_user(
    data: schemas.CreateUserInput,
    user_repo: Annotated[UserRepository, Depends(UserRepository)],
):
    password_hash = utils.Password(data.password).get_hash()
    user = user_repo.create_user(data, password_hash)
    return user


@router.get("/", response_model=list[schemas.UserResponse])
def get_all_users(
    user_repo: Annotated[UserRepository, Depends(UserRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    users = user_repo.get_all_users()
    return users


# update user [low priority]
# delete user [low priority]
