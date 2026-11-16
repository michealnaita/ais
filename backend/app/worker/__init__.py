"""
Celery worker entrypoint. This file is used to start the Celery worker process.
"""

from app.worker import tasks  # noqa: F401  registers tasks on celery_app
from app.worker.setup import celery_app

app = celery_app  # `celery -A app.worker worker` looks for `app`
