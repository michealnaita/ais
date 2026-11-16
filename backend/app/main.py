from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import Config
from app.routes import (
    assignments,
    auth,
    dashboard,
    documents,
    submissions,
    system_logs,
    users,
)
from app.services.setup import setup


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tests build their own in-memory database (tests/conftest.py)
    if Config.ENVIRONMENT != "testing":
        setup()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(system_logs.router, prefix="/system-logs", tags=["system-logs"])


@app.get("/")
async def home():
    return {"message": "Welcome to the AIS API"}
