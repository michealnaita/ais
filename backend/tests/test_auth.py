from datetime import datetime, timedelta, timezone

import pytest
from app import models
from app.services import auth
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.mocks import create_user_record

PASSWORD = "12345678"


@pytest.fixture()
def user(db: Session):
    user = models.User(**create_user_record(password=PASSWORD))
    db.add(user)
    db.commit()
    return user


def do_login(client: TestClient, user: models.User):
    return client.post("/auth/login", json={"email": user.email, "password": PASSWORD})


def set_cookie_header(response, name: str) -> str:
    """The raw Set-Cookie header for one cookie, lowercased for attribute checks."""
    headers = response.headers.get_list("set-cookie")
    return next(h for h in headers if h.startswith(f"{name}=")).lower()


def expires_in(token: str, token_type) -> timedelta:
    exp = auth.decode_token(token, token_type)["exp"]
    return datetime.fromtimestamp(exp, timezone.utc) - datetime.now(timezone.utc)


def expired_token(claims: dict, token_type) -> str:
    return auth._encode(claims, token_type, timedelta(seconds=-1))


def get_me(client: TestClient, user: models.User, **kwargs):
    """Any authenticated endpoint will do; this one returns the caller."""
    return client.get(f"/users/{user.id}", **kwargs)


def expire_session(client: TestClient, user: models.User):
    """Swap the client's session cookie for an expired one, keeping the refresh cookie."""
    client.cookies.delete(auth.SESSION_COOKIE)
    client.cookies.set(auth.SESSION_COOKIE, expired_token({"id": user.id}, "session"))


def use_cookies(client: TestClient, **cookies: str):
    client.cookies.clear()
    for name, value in cookies.items():
        client.cookies.set(name, value)


class TestLogin:
    def test_login_sets_session_and_refresh_cookies(
        self, client: TestClient, user: models.User
    ):
        res = do_login(client, user)

        assert res.status_code == 200
        session = set_cookie_header(res, auth.SESSION_COOKIE)
        refresh = set_cookie_header(res, auth.REFRESH_COOKIE)
        # Session token: readable by JavaScript
        assert "httponly" not in session
        assert "secure" in session
        # Refresh token: hidden from JavaScript, sent with every API request
        assert "httponly" in refresh
        assert "secure" in refresh
        assert "path=/;" in refresh + ";"

    def test_token_lifetimes(self, client: TestClient, user: models.User):
        res = do_login(client, user)

        session_ttl = expires_in(res.cookies[auth.SESSION_COOKIE], "session")
        refresh_ttl = expires_in(res.cookies[auth.REFRESH_COOKIE], "refresh")
        assert timedelta(minutes=14) < session_ttl <= timedelta(minutes=15)
        assert timedelta(days=6, hours=23) < refresh_ttl <= timedelta(days=7)

    def test_only_refresh_token_hash_is_stored(
        self, client: TestClient, db: Session, user: models.User
    ):
        res = do_login(client, user)

        db.refresh(user)
        refresh_token = res.cookies[auth.REFRESH_COOKIE]
        assert user.refresh_token == auth.hash_token(refresh_token)
        assert user.refresh_token != refresh_token

    def test_new_login_revokes_previous_refresh_token(
        self, client: TestClient, user: models.User
    ):
        old_refresh = do_login(client, user).cookies[auth.REFRESH_COOKIE]
        do_login(client, user)
        use_cookies(client, refresh_token=old_refresh)

        res = get_me(client, user)

        assert res.status_code == 401
        assert res.json()["detail"] == "Session has been revoked, sign in again"

    def test_wrong_password(self, client: TestClient, user: models.User):
        res = client.post(
            "/auth/login", json={"email": user.email, "password": "wrong_password"}
        )

        assert res.status_code == 401
        assert auth.SESSION_COOKIE not in res.cookies
        assert auth.REFRESH_COOKIE not in res.cookies

    def test_unregistered_user(self, client: TestClient):
        res = client.post(
            "/auth/login",
            json={"email": "notfound@test.com", "password": "wrong_password"},
        )

        assert res.status_code == 404
        assert auth.SESSION_COOKIE not in res.cookies


class TestSessionToken:
    def test_session_cookie_authenticates(self, client: TestClient, user: models.User):
        do_login(client, user)

        res = get_me(client, user)

        assert res.status_code == 200
        # A valid session token isn't reissued on every request
        assert auth.SESSION_COOKIE not in res.cookies

    def test_bearer_header_authenticates(self, client: TestClient, user: models.User):
        token = do_login(client, user).cookies[auth.SESSION_COOKIE]
        client.cookies.clear()

        res = get_me(client, user, headers={"Authorization": f"Bearer {token}"})

        assert res.status_code == 200

    def test_no_tokens(self, client: TestClient, user: models.User):
        assert get_me(client, user).status_code == 401

    def test_expired_session_without_refresh_token(
        self, client: TestClient, user: models.User
    ):
        use_cookies(client, session_token=expired_token({"id": user.id}, "session"))

        assert get_me(client, user).status_code == 401

    def test_refresh_token_cannot_be_used_as_session_token(
        self, client: TestClient, user: models.User
    ):
        refresh_token = do_login(client, user).cookies[auth.REFRESH_COOKIE]
        client.cookies.clear()

        res = get_me(client, user, headers={"Authorization": f"Bearer {refresh_token}"})

        assert res.status_code == 401


class TestAutomaticRefresh:
    def test_expired_session_is_refreshed_and_request_proceeds(
        self, client: TestClient, user: models.User
    ):
        do_login(client, user)
        expire_session(client, user)

        res = get_me(client, user)

        assert res.status_code == 200
        assert res.json()["id"] == user.id
        new_session = res.cookies[auth.SESSION_COOKIE]
        assert timedelta(minutes=14) < expires_in(new_session, "session")
        assert "httponly" not in set_cookie_header(res, auth.SESSION_COOKIE)

    def test_missing_session_is_refreshed(self, client: TestClient, user: models.User):
        do_login(client, user)
        client.cookies.delete(auth.SESSION_COOKIE)

        res = get_me(client, user)

        assert res.status_code == 200
        assert auth.SESSION_COOKIE in res.cookies

    def test_expired_bearer_token_is_refreshed(
        self, client: TestClient, user: models.User
    ):
        do_login(client, user)
        client.cookies.delete(auth.SESSION_COOKIE)
        expired = expired_token({"id": user.id}, "session")

        res = get_me(client, user, headers={"Authorization": f"Bearer {expired}"})

        assert res.status_code == 200
        assert auth.SESSION_COOKIE in res.cookies

    def test_revoked_refresh_token(
        self, client: TestClient, db: Session, user: models.User
    ):
        do_login(client, user)
        expire_session(client, user)
        user.refresh_token = None  # forced sign-out
        db.commit()

        res = get_me(client, user)

        assert res.status_code == 401
        assert res.json()["detail"] == "Session has been revoked, sign in again"
        assert auth.SESSION_COOKIE not in res.cookies

    def test_expired_refresh_token(
        self, client: TestClient, db: Session, user: models.User
    ):
        token = expired_token({"sub": user.id}, "refresh")
        user.refresh_token = auth.hash_token(token)
        db.commit()
        use_cookies(client, refresh_token=token)

        assert get_me(client, user).status_code == 401

    def test_session_token_cannot_be_used_to_refresh(
        self, client: TestClient, user: models.User
    ):
        session_token = do_login(client, user).cookies[auth.SESSION_COOKIE]
        use_cookies(
            client,
            session_token=expired_token({"id": user.id}, "session"),
            refresh_token=session_token,
        )

        assert get_me(client, user).status_code == 401

    def test_deactivated_user_is_not_refreshed(
        self, client: TestClient, db: Session, user: models.User
    ):
        do_login(client, user)
        expire_session(client, user)
        user.status = "deactivated"
        db.commit()

        res = get_me(client, user)

        assert res.status_code == 403
        assert res.json()["detail"] == "Account is deactivated"
        assert auth.SESSION_COOKIE not in res.cookies


class TestLogout:
    def test_logout_clears_cookies(self, client: TestClient, user: models.User):
        do_login(client, user)

        res = client.post("/auth/logout")

        assert res.status_code == 200
        assert auth.SESSION_COOKIE not in client.cookies
        assert auth.REFRESH_COOKIE not in client.cookies
        assert get_me(client, user).status_code == 401

    def test_logout_keeps_stored_refresh_token(
        self, client: TestClient, db: Session, user: models.User
    ):
        refresh_token = do_login(client, user).cookies[auth.REFRESH_COOKIE]

        client.post("/auth/logout")

        db.refresh(user)
        assert user.refresh_token == auth.hash_token(refresh_token)

    def test_logout_without_session(self, client: TestClient):
        assert client.post("/auth/logout").status_code == 200


class TestRefreshEndpoint:
    def test_issues_new_session_token(self, client: TestClient, user: models.User):
        do_login(client, user)
        expire_session(client, user)

        res = client.post("/auth/refresh")

        assert res.status_code == 200
        new_session = res.cookies[auth.SESSION_COOKIE]
        assert auth.decode_token(new_session, "session")["id"] == user.id
        assert timedelta(minutes=14) < expires_in(new_session, "session")
        assert "httponly" not in set_cookie_header(res, auth.SESSION_COOKIE)
        # The refresh token isn't rotated
        assert auth.REFRESH_COOKIE not in res.cookies
        # The new session token works on its own
        use_cookies(client, session_token=new_session)
        assert get_me(client, user).status_code == 200

    def test_without_refresh_token(self, client: TestClient, user: models.User):
        do_login(client, user)
        client.cookies.delete(auth.REFRESH_COOKIE)

        res = client.post("/auth/refresh")

        assert res.status_code == 401
        assert auth.SESSION_COOKIE not in res.cookies

    def test_expired_refresh_token(self, client: TestClient, user: models.User):
        use_cookies(
            client, refresh_token=expired_token({"sub": user.id, "jti": "x"}, "refresh")
        )

        assert client.post("/auth/refresh").status_code == 401

    def test_session_token_is_not_a_refresh_token(
        self, client: TestClient, user: models.User
    ):
        session = do_login(client, user).cookies[auth.SESSION_COOKIE]
        use_cookies(client, refresh_token=session)

        assert client.post("/auth/refresh").status_code == 401

    def test_revoked_refresh_token(self, client: TestClient, user: models.User):
        old_refresh = do_login(client, user).cookies[auth.REFRESH_COOKIE]
        do_login(client, user)
        use_cookies(client, refresh_token=old_refresh)

        res = client.post("/auth/refresh")

        assert res.status_code == 401
        assert res.json()["detail"] == "Session has been revoked, sign in again"

    def test_deactivated_user(
        self, client: TestClient, db: Session, user: models.User
    ):
        do_login(client, user)
        user.status = "deactivated"
        db.commit()

        res = client.post("/auth/refresh")

        assert res.status_code == 403
        assert auth.SESSION_COOKIE not in res.cookies
