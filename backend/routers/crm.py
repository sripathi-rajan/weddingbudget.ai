from fastapi import APIRouter, Depends, HTTPException, Header
from auth import require_admin
from sqlalchemy.orm import Session
from database import get_db
from models import CRMLead
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(tags=["CRM"])

class LeadCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    wedding_date: Optional[str] = None
    budget: Optional[float] = None
    notes: Optional[str] = None
    source: Optional[str] = "Wizard"

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    last_contacted_at: Optional[datetime] = None

class LeadOut(LeadCreate):
    id: int
    status: str
    priority: str
    notes: Optional[str] = None
    created_at: datetime
    last_contacted_at: Optional[datetime] = None

    class Config:
        orm_mode = True

@router.get("/leads", response_model=List[LeadOut])
def get_leads(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return db.query(CRMLead).order_by(CRMLead.created_at.desc()).all()

@router.post("/leads", response_model=LeadOut)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    db_lead = CRMLead(**lead.dict())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.patch("/leads/{lead_id}", response_model=LeadOut)
def update_lead(lead_id: int, lead_update: LeadUpdate, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    db_lead = db.query(CRMLead).filter(CRMLead.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    update_data = lead_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_lead, key, value)
    
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.delete("/leads/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    db_lead = db.query(CRMLead).filter(CRMLead.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(db_lead)
    db.commit()
    return {"message": "Lead deleted"}
