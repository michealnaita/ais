from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import Config

# Log every SQL statement only while developing. Off everywhere else, since
# the log includes parameter values such as password hashes.
engine = create_engine(
    Config.DATABASE_URL, echo=Config.ENVIRONMENT == "development"
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    with SessionLocal() as db:
        yield db
