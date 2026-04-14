"""SQLAlchemy ORM models for WeddingBudget.AI."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, func
)
from database import Base


class Artist(Base):
    __tablename__ = "artists"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    name       = Column(String(200), nullable=False)
    type       = Column(String(100), nullable=False)
    min_fee    = Column(Integer, nullable=False)
    max_fee    = Column(Integer, nullable=False)
    city       = Column(String(100), nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class FBRate(Base):
    __tablename__ = "fb_rates"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    meal_type     = Column(String(50), nullable=False)   # veg / non_veg / jain
    tier          = Column(String(50), nullable=False)   # basic / standard / premium
    per_head_cost = Column(Float, nullable=False)
    # meal_type+tier together represent a cost by meal occasion stored as JSON-ish flat rows
    # We store one row per (meal_type, tier, occasion) trio
    occasion      = Column(String(50), nullable=False)   # breakfast/lunch/dinner/snacks
    updated_at    = Column(DateTime, server_default=func.now(), onupdate=func.now())


class LogisticsCost(Base):
    __tablename__ = "logistics_costs"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    city         = Column(String(100), nullable=False)
    service_type = Column(String(100), nullable=False)   # ghodi / dholi / transfer_per_trip
    unit_cost    = Column(Integer, nullable=False)
    unit         = Column(String(50), nullable=True, default="per_event")
    updated_at   = Column(DateTime, server_default=func.now(), onupdate=func.now())


class DecorImage(Base):
    __tablename__ = "decor_images"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    filename      = Column(String(300), nullable=False, unique=True)
    url           = Column(Text, nullable=True)
    function_type = Column(String(100), nullable=True)
    style         = Column(String(100), nullable=True)
    complexity    = Column(Integer, nullable=True)   # 1-5
    seed_cost     = Column(Float, nullable=True)
    is_labelled   = Column(Boolean, default=False)
    created_at    = Column(DateTime, server_default=func.now())


class BudgetTracker(Base):
    __tablename__ = "budget_tracker"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(200), nullable=False)
    category   = Column(String(200), nullable=False)
    estimated  = Column(Float, nullable=True)
    actual     = Column(Float, nullable=True)
    difference = Column(Float, nullable=True)
    logged_at  = Column(DateTime, server_default=func.now())


class AdminSetting(Base):
    __tablename__ = "admin_settings"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    key        = Column(String(200), nullable=False, unique=True)
    value      = Column(Text, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    updated_by = Column(String(200), nullable=True)


class CostVersion(Base):
    __tablename__ = "cost_versions"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    table_name = Column(String(100), nullable=False)
    record_id  = Column(Integer, nullable=False)
    old_value  = Column(Text, nullable=True)
    new_value  = Column(Text, nullable=True)
    changed_at = Column(DateTime, server_default=func.now())


class RLAgentState(Base):
    """Persisted RL multiplier per budget category."""
    __tablename__ = "rl_agent_state"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    category   = Column(String(200), nullable=False, unique=True)
    multiplier = Column(Float, nullable=False, default=1.0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class RLTrainingLog(Base):
    """Append-only log of every RL agent update."""
    __tablename__ = "rl_training_log"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    category       = Column(String(200), nullable=False)
    estimated      = Column(Float, nullable=False)
    actual         = Column(Float, nullable=False)
    ratio          = Column(Float, nullable=False)
    old_multiplier = Column(Float, nullable=False)
    new_multiplier = Column(Float, nullable=False)
    accuracy_delta = Column(Float, nullable=True)
    timestamp      = Column(DateTime, server_default=func.now())


class FinalizedBudget(Base):
    """Final output of the wedding planner wizard, saved by users."""
    __tablename__ = "finalized_budgets"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    user_name       = Column(String(255), nullable=True)
    total_mid       = Column(Float, nullable=False)
    wedding_profile = Column(Text, nullable=False)  # JSON string
    created_at      = Column(DateTime, server_default=func.now())


class Vendor(Base):
    __tablename__ = "vendors"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(255), nullable=False)
    business     = Column(String(255), nullable=False)
    city         = Column(String(100), nullable=False)
    category     = Column(String(100), nullable=False)
    portfolio    = Column(Text, nullable=True)  # Store as JSON list of URLs/paths
    price_range  = Column(String(100), nullable=False)
    contact      = Column(String(255), nullable=False)
    is_approved  = Column(Boolean, nullable=False, default=False)
    created_at   = Column(DateTime, server_default=func.now())


class VendorPayment(Base):
    __tablename__ = "vendor_payments"

    id         = Column(Integer, primary_key=True, index=True)
    vendor     = Column(String(255), nullable=False)
    service    = Column(String(255), nullable=False)
    total_cost = Column(Float, nullable=False)
    paid       = Column(Float, nullable=False, default=0)
    due_date   = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class PaymentLog(Base):
    __tablename__ = "payment_logs"

    id           = Column(Integer, primary_key=True, index=True)
    category     = Column(String(100), nullable=False)
    vendor_name  = Column(String(255), nullable=True)
    total_amount = Column(Float, nullable=False, default=0.0)
    paid_amount  = Column(Float, nullable=False, default=0.0)
    due_date     = Column(String(100), nullable=True)
    payment_mode = Column(String(50), nullable=True) # cash/UPI/cheque
    notes        = Column(Text, nullable=True)
    created_at   = Column(DateTime, server_default=func.now())


class CRMLead(Base):
    __tablename__ = "crm_leads"

    id                = Column(Integer, primary_key=True, index=True)
    name              = Column(String(255), nullable=False)
    email             = Column(String(255), nullable=True)
    phone             = Column(String(20), nullable=True)
    wedding_date      = Column(String(100), nullable=True)
    budget            = Column(Float, nullable=True)
    source            = Column(String(100), default="Wizard") # Wizard, Direct, etc.
    status            = Column(String(50), default="New") # New, Contacted, In-Progress, Converted, Lost
    priority          = Column(String(20), default="Medium") # Low, Medium, High
    notes             = Column(Text, nullable=True)
    last_contacted_at = Column(DateTime, nullable=True)
    created_at        = Column(DateTime, server_default=func.now())
