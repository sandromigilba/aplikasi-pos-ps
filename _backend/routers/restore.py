
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Product, Transaction, TransactionItem, Setting
from pydantic import BaseModel
from typing import List, Optional

class RestoreItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    subtotal: float

class RestoreTransaction(BaseModel):
    id: str
    type: str
    date: str
    ps_session_id: Optional[str] = None
    ps_unit_name: Optional[str] = None
    ps_duration: Optional[int] = None
    ps_amount: Optional[float] = None
    consumption_amount: Optional[float] = None
    total_amount: float
    payment_method: str
    amount_paid: Optional[float] = None
    change: Optional[float] = None
    note: Optional[str] = None
    status: str = 'completed'
    cancel_reason: Optional[str] = None
    items: List[RestoreItem] = []

class RestoreProduct(BaseModel):
    id: str
    name: str
    category: str
    price: float
    stock: Optional[int] = None
    unit: str
    is_active: bool

class RestoreData(BaseModel):
    products: List[RestoreProduct] = []
    transactions: List[RestoreTransaction] = []

router = APIRouter(prefix='/api/restore', tags=['restore'])

@router.post('/')
def restore_database(data: RestoreData, db: Session = Depends(get_db)):
    # Delete all data
    db.query(TransactionItem).delete()
    db.query(Transaction).delete()
    db.query(Product).delete()

    import datetime
    
    for p in data.products:
        db_p = Product(**p.model_dump())
        db.add(db_p)

    for t in data.transactions:
        t_dict = t.model_dump()
        items = t_dict.pop('items')
        t_dict['date'] = datetime.datetime.fromisoformat(t_dict['date'].replace('Z', '+00:00'))
        
        db_t = Transaction(**t_dict)
        db.add(db_t)
        
        for item in items:
            import uuid
            db_item = TransactionItem(id=str(uuid.uuid4()), transaction_id=t.id, **item)
            db.add(db_item)
            
    db.commit()
    return {'status': 'ok'}

