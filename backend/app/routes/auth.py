from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas, utils
from app.config import Config
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
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not utils.Password(data.password).compare_hash(user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")

    auth_token = jwt.encode(
        schemas.AuthJWTPayload.model_validate(user).model_dump(),
        Config.JWT_SECRET,
        algorithm="HS256",
    )
    response.set_cookie(key="access_token", value=auth_token, httponly=True)

    return {"message": "Logged in"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out"}
