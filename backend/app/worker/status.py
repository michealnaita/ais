import logging
from typing import Literal

from app.worker.setup import celery_app

logger = logging.getLogger(__name__)

# How long the dashboard waits on Redis and on worker replies, in seconds
TIMEOUT = 1.0

WorkerStatus = Literal["running", "stopped"]


def get_worker_status() -> WorkerStatus:
    """"running" when at least one Celery worker answers a ping, otherwise
    "stopped" (no workers, or Redis is unreachable so no jobs can run)."""
    try:
        # Fail fast if Redis is down instead of retrying for a long time
        with celery_app.connection_for_write() as connection:
            connection.ensure_connection(max_retries=1, timeout=TIMEOUT)
        replies = celery_app.control.inspect(timeout=TIMEOUT).ping()
    except Exception as error:
        logger.warning("Celery broker unreachable: %s", error)
        return "stopped"
    return "running" if replies else "stopped"
