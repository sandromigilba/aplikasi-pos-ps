from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String(255), primary_key=True, index=True)
    name = Column(String(255), index=True)
    category = Column(String(255), index=True)
    price = Column(Float)
    stock = Column(Integer, nullable=True) # null = unlimited
    unit = Column(String(255))
    is_active = Column(Boolean, default=True)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(255), primary_key=True, index=True)
    type = Column(String(255)) # rental, cashier, combined
    date = Column(DateTime, default=datetime.datetime.now)
    total_amount = Column(Float)
    payment_method = Column(String(255)) # cash, qris
    amount_paid = Column(Float, nullable=True)
    change = Column(Float, nullable=True)
    note = Column(String(255), nullable=True)
    status = Column(String(255), default="completed")
    cancel_reason = Column(String(255), nullable=True)

    items = relationship("TransactionItem", back_populates="transaction", cascade="all, delete-orphan")

class TransactionItem(Base):
    __tablename__ = "transaction_items"

    id = Column(String(255), primary_key=True, index=True)
    transaction_id = Column(String(255), ForeignKey("transactions.id"))
    product_id = Column(String(255))
    product_name = Column(String(255))
    quantity = Column(Integer)
    unit_price = Column(Float)
    subtotal = Column(Float)

    transaction = relationship("Transaction", back_populates="items")

class Setting(Base):
    __tablename__ = "settings"

    key = Column(String(255), primary_key=True, index=True)
    value = Column(String(255))

