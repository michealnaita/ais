from typing import Annotated

import jwt
from app import schemas
from app.config import Config
from fastapi import Cookie, HTTPException, status


def get_current_user(
    access_token: Annotated[str | None, Cookie()] = None,
) -> schemas.AuthJWTPayload:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
    )
    if not access_token:
        raise unauthorized

    try:
        payload = jwt.decode(access_token, Config.JWT_SECRET, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        raise unauthorized

    return schemas.AuthJWTPayload.model_validate(payload)
