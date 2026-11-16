"""Sending documents to the worker. Only three places may do this: a student
submitting a document to an assignment, an admin persisting documents
through POST /documents/bulk-upload, and an instructor changing a
submission's similarity threshold."""

import logging

from app.worker import tasks

logger = logging.getLogger(__name__)


def queue_documents(document_ids: list[str]) -> list[str]:
    """Send each document to the processing worker. A broker error is logged
    rather than raised: the caller's database change is already committed,
    and the document stays "queued", so an admin can send it again through
    the bulk endpoint. Returns the ids that were sent."""
    sent = []
    for document_id in document_ids:
        try:
            tasks.process_document.delay(document_id)
        except Exception:
            logger.exception("Could not queue document %s for processing", document_id)
        else:
            sent.append(document_id)
    return sent
