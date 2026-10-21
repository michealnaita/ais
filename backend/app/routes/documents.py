import shutil
import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app import schemas
from app.config import Config
from app.repository import DocumentRepository
from app.services.auth import get_current_user

router = APIRouter()


@router.post("/upload", response_model=schemas.DocumentResponse)
def upload_document(
    file: UploadFile,
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
    document_repo: Annotated[DocumentRepository, Depends(DocumentRepository)],
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="File name is required"
        )

    # Store under a generated name so uploads can't collide or escape the storage dir
    file_name = f"{uuid.uuid4()}{Path(file.filename).suffix}"
    Config.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    file_path = Config.STORAGE_DIR / file_name
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        return document_repo.create_document(
            schemas.CreateDocumentInput(
                file_name=file_name,
                original_file_name=file.filename,
                size=file_path.stat().st_size,
                mime_type=file.content_type or "application/octet-stream",
                user_id=current_user.id,
            )
        )
    except Exception:
        file_path.unlink(missing_ok=True)
        raise
