from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status

from app import schemas, utils
from app.repository import AssignmentRepository, SystemLogRepository, UserRepository
from app.services.auth import get_current_user

router = APIRouter()


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
    "/", status_code=status.HTTP_201_CREATED, response_model=list[schemas.UserResponse]
)
def create_users(
    data: Annotated[list[schemas.CreateUserInput], Body(min_length=1)],
    user_repo: Annotated[UserRepository, Depends(UserRepository)],
    logs: Annotated[SystemLogRepository, Depends(SystemLogRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    emails = [user.email for user in data]
    duplicates = sorted({email for email in emails if emails.count(email) > 1})
    if duplicates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Duplicate emails in request", "emails": duplicates},
        )
    existing = [user.email for user in user_repo.get_users_by_email(emails)]
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": "Users with these emails already exist",
                "emails": existing,
            },
        )

    users = user_repo.create_users(
        [(user, utils.Password(user.password).get_hash()) for user in data]
    )
    logs.log(
        schemas.LogType.USERS_CREATED,
        "api.users",
        f"{current_user.email} created {len(users)} account(s): "
        + ", ".join(f"{u.email} ({u.role})" for u in users),
    )
    return users


@router.get("/", response_model=list[schemas.UserResponse])
def get_all_users(
    user_repo: Annotated[UserRepository, Depends(UserRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    users = user_repo.get_all_users()
    return users


@router.patch("/{user_id}/deactivate", response_model=schemas.UserResponse)
def deactivate_user(
    user_id: str,
    user_repo: Annotated[UserRepository, Depends(UserRepository)],
    logs: Annotated[SystemLogRepository, Depends(SystemLogRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account",
        )
    user = user_repo.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = user_repo.set_user_status(user, schemas.UserStatus.DEACTIVATED)
    logs.log(
        schemas.LogType.USER_DEACTIVATED,
        "api.users",
        f"{current_user.email} deactivated {user.email}",
    )
    return user


# update user [low priority]
# delete user [low priority]
