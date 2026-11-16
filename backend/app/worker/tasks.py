import logging

from celery.utils.log import get_task_logger
from sqlalchemy import delete

from app import models
from app.config import Config
from app.lib.file_parser import FileParser
from app.services.database import SessionLocal
from app.worker.setup import celery_app

logger: logging.Logger = get_task_logger(__name__)


@celery_app.task(name="documents.process_document")
def process_document(document_id: str) -> str:
    """Parse an uploaded .docx into chunks, store the chunks, write the
    rendered HTML to Config.HTML_DIR and mark the document processed."""
    with SessionLocal() as db:
        document = db.get(models.Document, document_id)
        if document is None:
            logger.warning("Document %s no longer exists; skipping", document_id)
            return "missing"

        try:
            file_path = Config.STORAGE_DIR / document.file_name
            parser = FileParser.parse(document.id, file_path)

            # Save the HTML. Each chunk <div> carries data-chunk-id, which is
            # also the chunk's row id, so the report can highlight matches.
            Config.HTML_DIR.mkdir(parents=True, exist_ok=True)
            (Config.HTML_DIR / f"{document.id}.html").write_text(
                parser.document_html, encoding="utf-8"
            )

            # Reprocessing replaces earlier chunks along with any matches
            # that point at them.
            db.execute(
                delete(models.DocumentChunk).where(
                    models.DocumentChunk.document_id == document.id
                )
            )

            db.add_all(
                models.DocumentChunk(
                    id=chunk["chunk_id"],
                    document_id=document.id,
                    index=index,
                    content=chunk["text"],
                )
                for index, chunk in enumerate(parser.chunks)
            )

            document.status = "processed"
            db.commit()
        except Exception:
            db.rollback()
            document.status = "failed"
            db.commit()
            logger.exception("Failed to process document %s", document_id)
            raise

    logger.info("Processed document %s (%d chunks)", document_id, len(parser.chunks))
    return "processed"
