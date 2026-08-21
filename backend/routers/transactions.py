from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, schemas
from database import get_db

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("/", response_model=List[schemas.Transaction])
def read_transactions(db: Session = Depends(get_db)):
    return crud.get_transactions(db)

@router.post("/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    return crud.create_transaction(db=db, transaction=transaction)

@router.put("/{transaction_id}/cancel", response_model=schemas.Transaction)
def cancel_transaction(transaction_id: str, cancel_data: schemas.TransactionCancel, db: Session = Depends(get_db)):
    tx = crud.cancel_transaction(db, transaction_id=transaction_id, reason=cancel_data.reason)
    if tx is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx
