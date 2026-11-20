import logging

from celery.utils.log import get_task_logger
from sqlalchemy import delete, select

from app import models
from app.config import Config
from app.lib.file_parser import FileParser
from app.services.database import SessionLocal
from app.similarity.engine import add_document, check_document
from app.worker.setup import celery_app

logger: logging.Logger = get_task_logger(__name__)


@celery_app.task(name="documents.process_document")
def process_document(document_id: str) -> str:
    """Parse an uploaded .docx into chunks, store the chunks, write the
    rendered HTML to Config.HTML_DIR, run similarity detection, and mark
    the document processed."""
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

            # Reprocessing replaces earlier similar-chunk links and chunks.
            db.execute(
                delete(models.SimilarChunk).where(
                    models.SimilarChunk.document_id == document.id
                )
            )
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
            db.flush()

            # Prepare chunks in the format expected by similarity.engine
            engine_chunks = [
                {"chunk_index": index, "text": chunk["text"]}
                for index, chunk in enumerate(parser.chunks)
            ]

            # Compare against all previously indexed documents
            result = check_document(document.id, engine_chunks)
            document.similarity_score = round(result["overall_score"])

            # Map flagged matches to DocumentChunk UUIDs for HTML highlighting
            if result["flagged_matches"]:
                local_chunk_ids = {
                    index: chunk["chunk_id"]
                    for index, chunk in enumerate(parser.chunks)
                }
                for match in result["flagged_matches"]:
                    source_chunk_id = db.scalar(
                        select(models.DocumentChunk.id).where(
                            models.DocumentChunk.document_id
                            == match["matched_document_id"],
                            models.DocumentChunk.index
                            == match["matched_chunk_index"],
                        )
                    )
                    local_chunk_id = local_chunk_ids.get(match["chunk_index"])
                    if local_chunk_id and source_chunk_id:
                        db.add(
                            models.SimilarChunk(
                                document_id=document.id,
                                document_chunk_id=local_chunk_id,
                                matched_chunk_id=source_chunk_id,
                            )
                        )

            # Index this document in ChromaDB for future comparisons
            add_document(document.id, engine_chunks)

            document.status = "processed"
            db.commit()
        except Exception:
            db.rollback()
            document.status = "failed"
            db.commit()
            logger.exception("Failed to process document %s", document_id)
            raise

    logger.info(
        "Processed document %s (%d chunks, score=%s%%)",
        document_id,
        len(parser.chunks),
        document.similarity_score,
    )
    return "processed"
