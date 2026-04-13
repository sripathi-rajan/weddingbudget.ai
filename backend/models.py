"""SQLAlchemy ORM models for WeddingBudget.AI."""
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, Boolean,
    UniqueConstraint,
)
from database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Artist(Base):
    __tablename__ = "artists"

    id      = Column(Integer, primary_key=True, index=True)
    name    = Column(String(255), nullable=False)
    type    = Column(String(100), nullable=False)
    min_fee = Column(Float, nullable=False)
    max_fee = Column(Float, nullable=False)
    city    = Column(String(100), nullable=False)


class FBRate(Base):
    __tablename__ = "fb_rates"
    __table_args__ = (
        UniqueConstraint("meal_type", "tier", "occasion", name="uq_fb_rate"),
    )

    id            = Column(Integer, primary_key=True, index=True)
    meal_type     = Column(String(50), nullable=False)
    tier          = Column(String(50), nullable=False)
    occasion      = Column(String(50), nullable=False)
    per_head_cost = Column(Float, nullable=False)


class LogisticsCost(Base):
    __tablename__ = "logistics_costs"
    __table_args__ = (
        UniqueConstraint("city", "service_type", name="uq_logistics"),
    )

    id           = Column(Integer, primary_key=True, index=True)
    city         = Column(String(100), nullable=False)
    service_type = Column(String(100), nullable=False)
    unit_cost    = Column(Float, nullable=False)
    unit         = Column(String(50), nullable=False, default="per_event")


class DecorImage(Base):
    __tablename__ = "decor_images"

    id         = Column(Integer, primary_key=True, index=True)
    style      = Column(String(100), nullable=False, index=True)
    image_path = Column(String(500), nullable=False)
    label      = Column(String(255), nullable=True)
    active     = Column(Boolean, nullable=False, default=True)


class BudgetTracker(Base):
    __tablename__ = "budget_tracker"

    id         = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), nullable=False, index=True)
    category   = Column(String(100), nullable=False)
    estimated  = Column(Float, nullable=False)
    actual     = Column(Float, nullable=False)
    difference = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)


class AdminSetting(Base):
    __tablename__ = "admin_settings"
    __table_args__ = (
        UniqueConstraint("key", name="uq_admin_key"),
    )

    id    = Column(Integer, primary_key=True, index=True)
    key   = Column(String(100), nullable=False)
    value = Column(String(500), nullable=False)


class CostVersion(Base):
    __tablename__ = "cost_versions"

    id         = Column(Integer, primary_key=True, index=True)
    table_name = Column(String(100), nullable=False)
    record_id  = Column(Integer, nullable=False)
    old_value  = Column(Text, nullable=True)
    new_value  = Column(Text, nullable=True)
    changed_at = Column(DateTime(timezone=True), nullable=False, default=_now)


class RLAgentState(Base):
    __tablename__ = "rl_agent_state"
    __table_args__ = (
        UniqueConstraint("category", name="uq_rl_category"),
    )

    id         = Column(Integer, primary_key=True, index=True)
    category   = Column(String(100), nullable=False)
    multiplier = Column(Float, nullable=False, default=1.0)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now)


class RLTrainingLog(Base):
    __tablename__ = "rl_training_log"

    id             = Column(Integer, primary_key=True, index=True)
    category       = Column(String(100), nullable=False, index=True)
    estimated      = Column(Float, nullable=False)
    actual         = Column(Float, nullable=False)
    ratio          = Column(Float, nullable=False)
    old_multiplier = Column(Float, nullable=False)
    new_multiplier = Column(Float, nullable=False)
    accuracy_delta = Column(Float, nullable=False)
    timestamp      = Column(DateTime(timezone=True), nullable=False, default=_now)
