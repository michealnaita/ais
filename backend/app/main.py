from fastapi import FastAPI

from app.config import Config
from app.routes import assignments, auth, documents, submissions, users
from app.services.database import Base, engine

if Config.ENVIRONMENT != "testing":
    Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(submissions.router, prefix="/submissions", tags=["submissions"])


@app.get("/")
async def home():
    return {"message": "Welcome to the AIS API"}
