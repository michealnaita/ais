import pytest
from app import models
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session
from tests.fixtures import create_user, login

NEW_USERS = [
    {
        "email": "new_student@test.com",
        "firstName": "New",
        "lastName": "Student",
        "role": "student",
        "password": "password",
    },
    {
        "email": "new_instructor@test.com",
        "firstName": "New",
        "lastName": "Instructor",
        "role": "instructor",
        "password": "password",
    },
]


def count_users(db: Session, emails: list[str]) -> int:
    return len(
        db.execute(select(models.User).where(models.User.email.in_(emails)))
        .scalars()
        .all()
    )


class TestCreateUsers:
    def test_admin_creates_users_in_bulk(self, client: TestClient, db: Session):
        admin = create_user(db, role="admin", email="admin@test.com")
        login(client, admin.email)

        response = client.post("/users/", json=NEW_USERS)

        assert response.status_code == 201
        assert [(u["email"], u["role"]) for u in response.json()] == [
            (u["email"], u["role"]) for u in NEW_USERS
        ]
        assert count_users(db, [u["email"] for u in NEW_USERS]) == 2

    def test_existing_email_creates_nobody(self, client: TestClient, db: Session):
        admin = create_user(db, role="admin", email="admin@test.com")
        create_user(db, email="new_instructor@test.com")
        login(client, admin.email)

        response = client.post("/users/", json=NEW_USERS)

        assert response.status_code == 409
        assert response.json()["detail"]["emails"] == ["new_instructor@test.com"]
        assert count_users(db, ["new_student@test.com"]) == 0

    def test_duplicate_emails_in_request(self, client: TestClient, db: Session):
        admin = create_user(db, role="admin", email="admin@test.com")
        login(client, admin.email)

        response = client.post("/users/", json=[NEW_USERS[0], NEW_USERS[0]])

        assert response.status_code == 400
        assert count_users(db, ["new_student@test.com"]) == 0


def test_get_user(client: TestClient, db: Session):
    user = create_user(db)
    login(client, user.email)
    response = client.get(f"/users/{user.id}")
    assert response.status_code == 200
    assert response.json().get("id") == user.id
    assert response.json().get("role") == user.role


def test_get_all_users(client: TestClient, db: Session):
    user = create_user(db, role="admin")
    login(client, user.email)
    response = client.get("/users/")
    assert response.status_code == 200
    assert len(response.json()) == 1


class TestDeactivateUser:
    def test_admin_deactivates_user(self, client: TestClient, db: Session):
        admin = create_user(db, role="admin", email="admin@test.com")
        student = create_user(db, email="student@test.com")
        login(client, admin.email)

        response = client.patch(f"/users/{student.id}/deactivate")

        assert response.status_code == 200
        assert response.json().get("status") == "deactivated"
        db.refresh(student)
        assert student.status == "deactivated"

    def test_deactivated_user_cannot_login(self, client: TestClient, db: Session):
        student_password = "password"
        admin = create_user(db, role="admin", email="admin@test.com")
        student = create_user(db, email="student@test.com", password=student_password)
        login(client, admin.email)
        client.patch(f"/users/{student.id}/deactivate")
        client.post("/auth/logout")
        client.cookies.clear()

        response = client.post(
            "/auth/login",
            json={"email": student.email, "password": student_password},
        )

        assert response.status_code == 403
        assert response.cookies.get("session_token") is None

    def test_deactivated_user_cannot_refresh_session(
        self, client: TestClient, db: Session
    ):
        admin = create_user(db, role="admin", email="admin@test.com")
        student = create_user(db, email="student@test.com")
        login(client, student.email)
        student_refresh = client.cookies["refresh_token"]
        client.cookies.clear()
        login(client, admin.email)

        client.patch(f"/users/{student.id}/deactivate")

        # Deactivation is tracked by status alone; the refresh token is untouched
        db.refresh(student)
        assert student.status == "deactivated"
        assert student.refresh_token is not None
        # ...but once the session token is gone, the refresh is refused
        client.cookies.clear()
        client.cookies.set("refresh_token", student_refresh)
        response = client.get(f"/users/{student.id}")
        assert response.status_code == 403
        assert response.json()["detail"] == "Account is deactivated"


@pytest.fixture
def admin(db: Session):
    return create_user(db, role="admin", email="admin@test.com")


def test_api_speaks_camel_case(client: TestClient, admin):
    login(client, admin.email)

    response = client.post(
        "/users/",
        json=[
            {
                "email": "camel@test.com",
                "firstName": "Camel",
                "lastName": "Case",
                "role": "student",
                "password": "password",
            }
        ],
    )

    assert response.status_code == 201
    created = response.json()[0]
    assert created["firstName"] == "Camel"
    assert created["lastName"] == "Case"
    assert "first_name" not in created
