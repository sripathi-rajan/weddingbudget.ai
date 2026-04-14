from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from database import get_db
import models

router = APIRouter(tags=["Payments"])

class PaymentLogSchema(BaseModel):
    id: Optional[int] = None
    category: str
    vendor_name: Optional[str] = None
    total_amount: float
    paid_amount: float
    due_date: Optional[str] = None
    payment_mode: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PaymentLogSchema])
def get_payments(db: Session = Depends(get_db)):
    return db.query(models.PaymentLog).order_by(models.PaymentLog.created_at.desc()).all()

@router.post("/", response_model=PaymentLogSchema)
def create_payment_log(payment: PaymentLogSchema, db: Session = Depends(get_db)):
    if payment.id:
        db_payment = db.query(models.PaymentLog).filter(models.PaymentLog.id == payment.id).first()
        if not db_payment:
            raise HTTPException(status_code=404, detail="Payment log not found")
        db_payment.category = payment.category
        db_payment.vendor_name = payment.vendor_name
        db_payment.total_amount = payment.total_amount
        db_payment.paid_amount = payment.paid_amount
        db_payment.due_date = payment.due_date
        db_payment.payment_mode = payment.payment_mode
        db_payment.notes = payment.notes
    else:
        db_payment = models.PaymentLog(
            category=payment.category,
            vendor_name=payment.vendor_name,
            total_amount=payment.total_amount,
            paid_amount=payment.paid_amount,
            due_date=payment.due_date,
            payment_mode=payment.payment_mode,
            notes=payment.notes
        )
        db.add(db_payment)
    
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.delete("/{payment_id}")
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    db_payment = db.query(models.PaymentLog).filter(models.PaymentLog.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment log not found")
    db.delete(db_payment)
    db.commit()
    return {"status": "ok"}
