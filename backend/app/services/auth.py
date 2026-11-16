import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated, Literal

import jwt
from fastapi import Cookie, Depends, Header, HTTPException, Response, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.config import Config
from app.services.database import get_db

SESSION_TOKEN_TTL = timedelta(minutes=15)
REFRESH_TOKEN_TTL = timedelta(days=7)
SESSION_COOKIE = "session_token"
REFRESH_COOKIE = "refresh_token"
ALGORITHM = "HS256"

TokenType = Literal["session", "refresh"]


def _encode(claims: dict, token_type: TokenType, ttl: timedelta) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {**claims, "type": token_type, "iat": now, "exp": now + ttl},
        Config.JWT_SECRET,
        algorithm=ALGORITHM,
    )


def decode_token(token: str, token_type: TokenType) -> dict:
    """Return the token's claims; raise jwt.InvalidTokenError if it's expired,
    tampered with, or the wrong kind of token."""
    payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[ALGORITHM])
    if payload.get("type") != token_type:
        raise jwt.InvalidTokenError("Wrong token type")
    return payload


def create_session_token(user: models.User) -> str:
    # camelCase claims, since the frontend reads this token
    claims = schemas.AuthJWTPayload.model_validate(user).model_dump(mode="json")
    return _encode(claims, "session", SESSION_TOKEN_TTL)


def create_refresh_token(user_id: str) -> str:
    # jti makes every refresh token unique, even two issued in the same second
    return _encode(
        {"sub": user_id, "jti": str(uuid.uuid4())}, "refresh", REFRESH_TOKEN_TTL
    )


def hash_token(token: str) -> str:
    """Only this hash is stored, so a leaked database can't be replayed as tokens."""
    return hashlib.sha256(token.encode()).hexdigest()


def set_session_cookie(response: Response, user: models.User):
    response.set_cookie(
        key=SESSION_COOKIE,
        value=create_session_token(user),
        max_age=int(SESSION_TOKEN_TTL.total_seconds()),
        httponly=False,  # readable by the frontend's JavaScript
        secure=True,
        samesite="lax",
    )


def set_refresh_cookie(response: Response, refresh_token: str):
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=refresh_token,
        max_age=int(REFRESH_TOKEN_TTL.total_seconds()),
        httponly=True,
        secure=True,
        samesite="strict",
    )


def delete_auth_cookies(response: Response):
    response.delete_cookie(key=SESSION_COOKIE, secure=True, samesite="lax")
    response.delete_cookie(
        key=REFRESH_COOKIE, httponly=True, secure=True, samesite="strict"
    )


def get_refresh_token_user(db: Session, refresh_token: str | None):
    """The user a refresh token belongs to, or None if the token is missing,
    invalid or expired. Doesn't check revocation or status: see
    is_current_refresh_token and UserStatus."""
    if not refresh_token:
        return None
    try:
        payload = decode_token(refresh_token, "refresh")
    except jwt.InvalidTokenError:
        return None
    return db.get(models.User, payload.get("sub"))


def is_current_refresh_token(user: models.User, refresh_token: str) -> bool:
    """False once the user's stored token is cleared or replaced, i.e. they've
    signed out, been forced out, or signed in again elsewhere."""
    return user.refresh_token == hash_token(refresh_token)


def authenticate_refresh_token(
    db: Session, refresh_token: str | None
) -> models.User:
    """The user behind a refresh token that may be used to issue a new
    session token: valid, still the user's current one, and the account is
    active. Raises 401/403 otherwise."""
    user = get_refresh_token_user(db, refresh_token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    if user.status != schemas.UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated"
        )
    if not is_current_refresh_token(user, refresh_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked, sign in again",
        )
    return user


def get_current_user(
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    session_token: Annotated[str | None, Cookie()] = None,
    refresh_token: Annotated[str | None, Cookie()] = None,
    authorization: Annotated[str | None, Header()] = None,
) -> schemas.AuthJWTPayload:
    """Authenticate with the session token. If it's missing or expired, fall
    back to the refresh token: when that is still the user's current one and
    the account is active, issue a fresh session cookie on this response and
    carry on."""
    token = session_token
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[len("bearer ") :]

    if token:
        try:
            return schemas.AuthJWTPayload.model_validate(
                decode_token(token, "session")
            )
        except jwt.InvalidTokenError:
            pass

    user = authenticate_refresh_token(db, refresh_token)
    set_session_cookie(response, user)
    return schemas.AuthJWTPayload.model_validate(user)
