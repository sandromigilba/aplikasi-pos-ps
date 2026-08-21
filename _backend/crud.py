from sqlalchemy.orm import Session
from models import Product, Transaction, TransactionItem, Setting
import schemas
import uuid
import datetime

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = Product(id=str(uuid.uuid4()), **product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: str, product: schemas.ProductCreate):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        for key, value in product.model_dump().items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: str):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    now = datetime.datetime.now()
    prefix = now.strftime("RNI-%y%m%d-")
    
    last_tx = db.query(Transaction).filter(Transaction.id.like(f"{prefix}%")).order_by(Transaction.id.desc()).first()
    
    if last_tx:
        try:
            last_seq = int(last_tx.id.split('-')[-1])
            new_seq = last_seq + 1
        except:
            new_seq = 1
    else:
        new_seq = 1
        
    new_id = f"{prefix}{new_seq:04d}"

    db_transaction = Transaction(
        id=new_id,
        type=transaction.type,
        date=datetime.datetime.now(),
        total_amount=transaction.total_amount,
        payment_method=transaction.payment_method,
        amount_paid=transaction.amount_paid,
        change=transaction.change,
        note=transaction.note
    )
    db.add(db_transaction)
    
    # Process items and deduct stock
    for item in transaction.items:
        db_item = TransactionItem(id=str(uuid.uuid4()), transaction_id=db_transaction.id, **item.model_dump())
        db.add(db_item)
        
        # Deduct stock
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.stock is not None:
            product.stock = max(0, product.stock - item.quantity)
            
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def get_transactions(db: Session):
    return db.query(Transaction).all()

def get_settings(db: Session):
    return db.query(Setting).all()

def set_setting(db: Session, setting: schemas.Setting):
    db_setting = db.query(Setting).filter(Setting.key == setting.key).first()
    if db_setting:
        db_setting.value = setting.value
    else:
        db_setting = Setting(key=setting.key, value=setting.value)
        db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

def cancel_transaction(db: Session, transaction_id: str, reason: str):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if tx and tx.status != 'canceled':
        tx.status = 'canceled'
        tx.cancel_reason = reason
        for item in tx.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product and product.stock is not None:
                product.stock += item.quantity
        db.commit()
        db.refresh(tx)
    return tx
