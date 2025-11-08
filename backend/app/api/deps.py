from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from ..database import get_session


def get_db() -> Generator[Session, None, None]:
    with get_session() as session:
        yield session

