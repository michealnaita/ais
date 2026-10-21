import pytest
from app import models
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.mocks import create_user_record


@pytest.fixture()
def user(db: Session):
    password = "12345678"
    user_record = create_user_record(password=password)
    user = models.User(**user_record)
    db.add(user)
    db.commit()
    return user


class TestAuthentication:
    def test_successful_login(self, client: TestClient, user: models.User):
        password = "12345678"
        res_success = client.post(
            "/auth/login", json={"email": user.email, "password": password}
        )
        assert res_success.status_code == 200
        assert res_success.cookies.get("access_token") is not None

    def test_logout(self, client: TestClient, user: models.User):
        password = "12345678"
        res_login = client.post(
            "/auth/login", json={"email": user.email, "password": password}
        )
        assert res_login.status_code == 200
        assert res_login.cookies.get("access_token") is not None

        res_logout = client.post("/auth/logout")
        assert res_logout.status_code == 200
        assert res_logout.cookies.get("access_token") is None

    def test_failed_login(self, client: TestClient, user: models.User):
        res = client.post(
            "/auth/login",
            json={"email": user.email, "password": "wrong_password"},
        )
        assert res.cookies.get("access_token") is None
        assert res.status_code == 401

    def test_unregistered_user_login(self, client: TestClient):
        res = client.post(
            "/auth/login",
            json={"email": "notfound@test.com", "password": "wrong_password"},
        )
        assert res.cookies.get("access_token") is None
        assert res.status_code == 404

    def test_access_protected_route(self, client: TestClient, user: models.User):
        pass
