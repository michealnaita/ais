from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app import schemas
from app.repository import SystemLogRepository
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=list[schemas.SystemLogResponse])
def get_system_logs(
    logs_repo: Annotated[SystemLogRepository, Depends(SystemLogRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return logs_repo.get_all_logs()
