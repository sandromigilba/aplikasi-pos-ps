import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Gunakan TIDB_URL dari .env jika ada, jika tidak fallback ke SQLite lokal
TIDB_URL = os.getenv("TIDB_URL")
SQLALCHEMY_DATABASE_URL = TIDB_URL if TIDB_URL else "sqlite:///./pos.db"

# Untuk TiDB (MySQL), kita tidak perlu check_same_thread
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
