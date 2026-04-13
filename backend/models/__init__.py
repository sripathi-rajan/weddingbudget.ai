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
