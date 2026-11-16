import shutil
import uuid
import zipfile
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app import schemas
from app.config import Config
from app.repository import DocumentRepository, SystemLogRepository
from app.services.auth import get_current_user
from app.worker.dispatch import queue_documents

router = APIRouter()

DOCX_EXTENSION = ".docx"
DOCX_MIME_TYPE = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)


def is_docx(file: UploadFile) -> bool:
    """Check the content, not just the name: a .docx is a ZIP archive that
    contains word/document.xml. Legacy .doc files aren't supported because
    the parser (python-docx) can't read them."""
    if Path(file.filename).suffix.lower() != DOCX_EXTENSION:
        return False
    try:
        with zipfile.ZipFile(file.file) as archive:
            return "word/document.xml" in archive.namelist()
    except zipfile.BadZipFile:
        return False
    finally:
        file.file.seek(0)


@router.get("/", response_model=list[schemas.DocumentResponse])
def get_all_documents(
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
    document_repo: Annotated[DocumentRepository, Depends(DocumentRepository)],
):
    if current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return document_repo.get_all_documents()


@router.post("/bulk-upload", response_model=schemas.PersistDocumentsResponse)
def persist_documents(
    data: schemas.PersistDocumentsInput,
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
    document_repo: Annotated[DocumentRepository, Depends(DocumentRepository)],
    logs: Annotated[SystemLogRepository, Depends(SystemLogRepository)],
):
    """Admin only: persist the given documents by clearing their expiry, and
    send the ones still queued to the worker. Unknown ids are reported back
    rather than failing the whole request."""
    if current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    requested = list(dict.fromkeys(data.document_ids))  # dedupe, keep order
    persisted = set(document_repo.persist_documents(requested))
    if persisted:
        logs.log(
            schemas.LogType.DOCUMENTS_PERSISTED,
            "api.documents",
            f"{current_user.email} persisted {len(persisted)} document(s)",
        )
    persisted_ids = [i for i in requested if i in persisted]
    queued = set(
        queue_documents(document_repo.get_queued_document_ids(persisted_ids))
    )
    return schemas.PersistDocumentsResponse(
        persisted_ids=persisted_ids,
        not_found_ids=[i for i in requested if i not in persisted],
        queued_ids=[i for i in persisted_ids if i in queued],
    )


@router.post("/upload", response_model=schemas.DocumentResponse)
def upload_document(
    file: UploadFile,
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
    document_repo: Annotated[DocumentRepository, Depends(DocumentRepository)],
    logs: Annotated[SystemLogRepository, Depends(SystemLogRepository)],
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="File name is required"
        )
    if not is_docx(file):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only Word documents (.docx) can be uploaded",
        )

    # Store under a generated name so uploads can't collide or escape the storage dir
    file_name = f"{uuid.uuid4()}{DOCX_EXTENSION}"
    Config.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    file_path = Config.STORAGE_DIR / file_name
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        document = document_repo.create_document(
            schemas.CreateDocumentInput(
                file_name=file_name,
                original_file_name=file.filename,
                size=file_path.stat().st_size,
                mime_type=DOCX_MIME_TYPE,
                author_id=current_user.id,
            )
        )
    except Exception:
        file_path.unlink(missing_ok=True)
        raise
    logs.log(
        schemas.LogType.DOCUMENT_UPLOADED,
        "api.documents",
        f"{current_user.email} uploaded \"{file.filename}\" ({document.size} bytes)",
    )
    return document
