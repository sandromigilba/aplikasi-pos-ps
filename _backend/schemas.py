from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    category: str
    price: float
    stock: Optional[int] = None
    unit: str
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: str
    class Config:
        from_attributes = True

class TransactionItemBase(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    subtotal: float

class TransactionItemCreate(TransactionItemBase):
    pass

class TransactionItem(TransactionItemBase):
    id: str
    transaction_id: str
    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    type: str
    total_amount: float
    payment_method: str
    amount_paid: Optional[float] = None
    change: Optional[float] = None
    note: Optional[str] = None
    status: str = "completed"
    cancel_reason: Optional[str] = None

class TransactionCreate(TransactionBase):
    items: List[TransactionItemCreate] = []

class Transaction(TransactionBase):
    id: str
    date: datetime
    items: List[TransactionItem] = []
    class Config:
        from_attributes = True

class Setting(BaseModel):
    key: str
    value: str
    class Config:
        from_attributes = True

class TransactionCancel(BaseModel):
    reason: str
