from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import crud, schemas
from database import get_db

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("/", response_model=List[schemas.Setting])
def read_settings(db: Session = Depends(get_db)):
    return crud.get_settings(db)

@router.post("/", response_model=schemas.Setting)
def update_setting(setting: schemas.Setting, db: Session = Depends(get_db)):
    return crud.set_setting(db=db, setting=setting)

