from app import models
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session
from tests.fixtures import create_user, login


def test_create_user(client: TestClient, db: Session):
    response = client.post(
        "/users/",
        json={
            "email": "user@test.com",
            "first_name": "John",
            "last_name": "Doe",
            "role": "student",
            "password": "password",
        },
    )
    user = (
        db.execute(select(models.User).where(models.User.email == "user@test.com"))
        .scalars()
        .first()
    )
    assert user is not None
    assert response.status_code == 201


def test_get_user(client: TestClient, db: Session):
    user = create_user(db)
    login(client, user.email)
    response = client.get(f"/users/{user.id}")
    assert response.status_code == 200
    assert response.json().get("id") == user.id


def test_get_all_users(client: TestClient, db: Session):
    user = create_user(db, role="admin")
    login(client, user.email)
    response = client.get("/users/")
    assert response.status_code == 200
    assert len(response.json()) == 1
