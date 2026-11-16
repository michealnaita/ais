from celery import Celery

from app.config import Config

celery_app = Celery(
    "ais",
    broker=Config.REDIS_URL,
    backend=Config.REDIS_URL,
    include=["app.worker.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    # Ack only after the task finishes, so a crashed worker's job is redelivered
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    # Parsing is slow and uneven; don't let one worker hoard queued documents
    worker_prefetch_multiplier=1,
    result_expires=60 * 60 * 24,
    broker_connection_retry_on_startup=True,
)
