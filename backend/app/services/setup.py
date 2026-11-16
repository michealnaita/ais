import logging

from app import models, schemas, utils
from app.config import Config
from app.repository import SystemLogRepository
from app.services.database import Base, SessionLocal, engine
from sqlalchemy import select
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def setup():
    """Prepare a fresh or existing database: create any missing tables, then
    make sure there is at least one admin who can log in."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        create_default_admin(db)


def create_default_admin(db: Session) -> models.User | None:
    """Create the admin from DEFAULT_ADMIN_* settings if no admin exists yet.
    Returns the new admin, or None if nothing was created."""
    has_admin = db.execute(
        select(models.User.id).where(models.User.role == schemas.UserRole.ADMIN)
    ).first()
    if has_admin:
        return None

    email, password = Config.DEFAULT_ADMIN_EMAIL, Config.DEFAULT_ADMIN_PASSWORD
    if not email or not password:
        logger.warning(
            "No admin user exists and DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD "
            "are not set; skipping default admin creation"
        )
        return None

    taken = db.execute(select(models.User.id).where(models.User.email == email)).first()
    if taken:
        logger.warning(
            "No admin user exists, but %s is already used by a non-admin account; "
            "skipping default admin creation",
            email,
        )
        return None

    admin = models.User(
        email=email,
        first_name=Config.DEFAULT_ADMIN_FIRST_NAME,
        last_name=Config.DEFAULT_ADMIN_LAST_NAME,
        role=schemas.UserRole.ADMIN,
        password_hash=utils.Password(password.get_secret_value()).get_hash(),
    )
    db.add(admin)
    db.commit()
    SystemLogRepository(db).log(
        schemas.LogType.USERS_CREATED,
        "setup",
        f"Created default admin account {email}",
    )
    logger.info("Created default admin account %s", email)
    return admin
