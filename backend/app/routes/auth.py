from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas, utils
from app.repository import SystemLogRepository
from app.services import auth
from app.services.database import get_db

router = APIRouter()


@router.post("/login")
def login(
    data: schemas.LoginInput,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
):
    user = (
        db.execute(select(models.User).where(models.User.email == data.email))
        .scalars()
        .first()
    )
    logs = SystemLogRepository(db)
    if not user:
        logs.log(
            schemas.LogType.LOGIN_FAILED,
            "api.auth",
            f"Failed login attempt for {data.email} (unknown account)",
            schemas.LogLevel.WARNING,
        )
        raise HTTPException(status_code=404, detail="User not found")

    if not utils.Password(data.password).compare_hash(user.password_hash):
        logs.log(
            schemas.LogType.LOGIN_FAILED,
            "api.auth",
            f"Failed login attempt for {user.email} (bad password)",
            schemas.LogLevel.WARNING,
        )
        raise HTTPException(status_code=401, detail="Invalid password")

    if user.status != schemas.UserStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    refresh_token = auth.create_refresh_token(user.id)
    user.refresh_token = auth.hash_token(refresh_token)
    db.commit()

    auth.set_session_cookie(response, user)
    auth.set_refresh_cookie(response, refresh_token)
    logs.log(schemas.LogType.LOGIN, "api.auth", f"{user.email} logged in")
    return {"message": "Logged in"}


@router.post("/refresh")
def refresh(
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    refresh_token: Annotated[str | None, Cookie()] = None,
):
    """Issue a new session token from the refresh cookie, so the client can
    renew its session before the 15-minute token expires. The refresh token
    itself isn't rotated: it keeps its original 7-day expiry."""
    user = auth.authenticate_refresh_token(db, refresh_token)
    auth.set_session_cookie(response, user)
    return {"message": "Session refreshed"}


@router.post("/logout")
def logout(response: Response):
    # Only this device's cookies are cleared. The stored refresh token is left
    # alone, because clearing it would sign the user out on every device.
    auth.delete_auth_cookies(response)
    return {"message": "Logged out"}
