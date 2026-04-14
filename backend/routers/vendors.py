from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
import os
import json
import uuid
from database import get_db
from models import Vendor
from auth import require_admin

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads", "portfolio")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/register")
async def register_vendor(
    name: str = Form(...),
    business: str = Form(...),
    city: str = Form(...),
    category: str = Form(...),
    price_range: str = Form(...),
    contact: str = Form(...),
    portfolio: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    portfolio_paths = []
    if portfolio:
        for file in portfolio:
            if not file or not file.filename:
                continue
            ext = os.path.splitext(file.filename)[1]
            filename = f"{uuid.uuid4()}{ext}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(await file.read())
            # We'll store the public URL path
            portfolio_paths.append(f"/static/uploads/portfolio/{filename}")

    new_vendor = Vendor(
        name=name,
        business=business,
        city=city,
        category=category,
        price_range=price_range,
        contact=contact,
        portfolio=json.dumps(portfolio_paths),
        is_approved=False
    )
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return {"message": "Registration successful. Pending admin approval.", "vendor_id": new_vendor.id}

@router.get("/approved")
def get_approved_vendors(category: Optional[str] = None, city: Optional[str] = None, db: Session = Depends(get_db)):
    query = select(Vendor).where(Vendor.is_approved == True)
    if category:
        query = query.where(Vendor.category == category)
    if city:
        query = query.where(Vendor.city == city)
    
    vendors = db.execute(query).scalars().all()
    # Parse portfolio JSON
    result = []
    for v in vendors:
        v_dict = {c.name: getattr(v, c.name) for c in v.__table__.columns}
        v_dict["portfolio"] = json.loads(v.portfolio) if v.portfolio else []
        result.append(v_dict)
    return result

@router.get("/admin/all", dependencies=[Depends(require_admin)])
def get_all_vendors(db: Session = Depends(get_db)):
    vendors = db.execute(select(Vendor).order_by(Vendor.created_at.desc())).scalars().all()
    result = []
    for v in vendors:
        v_dict = {c.name: getattr(v, c.name) for c in v.__table__.columns}
        v_dict["portfolio"] = json.loads(v.portfolio) if v.portfolio else []
        result.append(v_dict)
    return result

@router.patch("/admin/approve/{vendor_id}", dependencies=[Depends(require_admin)])
def approve_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.is_approved = True
    db.commit()
    return {"message": "Vendor approved successfully"}

@router.delete("/admin/delete/{vendor_id}", dependencies=[Depends(require_admin)])
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(vendor)
    db.commit()
    return {"message": "Vendor deleted successfully"}
