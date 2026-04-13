"""Seed initial data into the database on first startup."""
from sqlalchemy import select, func
from database import SessionLocal, create_all
from models import Artist, FBRate, LogisticsCost, AdminSetting, RLTrainingLog


ARTISTS = [
    {"name": "Local DJ",              "type": "DJ",      "min_fee": 50000,   "max_fee": 150000,  "city": "Mumbai"},
    {"name": "Professional DJ",       "type": "DJ",      "min_fee": 200000,  "max_fee": 500000,  "city": "Delhi"},
    {"name": "Bollywood Singer A",    "type": "Singer",  "min_fee": 800000,  "max_fee": 1200000, "city": "Mumbai"},
    {"name": "Bollywood Singer B",    "type": "Singer",  "min_fee": 500000,  "max_fee": 900000,  "city": "Delhi"},
    {"name": "Live Band (Local)",     "type": "Band",    "min_fee": 100000,  "max_fee": 300000,  "city": "Bangalore"},
    {"name": "Live Band (National)",  "type": "Band",    "min_fee": 500000,  "max_fee": 1500000, "city": "Mumbai"},
    {"name": "Folk Artist",           "type": "Folk",    "min_fee": 30000,   "max_fee": 100000,  "city": "Jaipur"},
    {"name": "Myra Entertainment",    "type": "Group",   "min_fee": 200000,  "max_fee": 600000,  "city": "Mumbai"},
    {"name": "Choreographer",         "type": "Dance",   "min_fee": 50000,   "max_fee": 200000,  "city": "Mumbai"},
    {"name": "Anchor / Emcee",        "type": "Anchor",  "min_fee": 30000,   "max_fee": 150000,  "city": "Delhi"},
    {"name": "Jugalbandi Duo",        "type": "Singer",  "min_fee": 600000,  "max_fee": 1000000, "city": "Chennai"},
    {"name": "Sufi Night Band",       "type": "Band",    "min_fee": 150000,  "max_fee": 400000,  "city": "Jaipur"},
    {"name": "Celebrity DJ",          "type": "DJ",      "min_fee": 700000,  "max_fee": 2000000, "city": "Mumbai"},
    {"name": "Classical Dancer",      "type": "Dance",   "min_fee": 80000,   "max_fee": 250000,  "city": "Chennai"},
    {"name": "Ghazal Singer",         "type": "Singer",  "min_fee": 200000,  "max_fee": 500000,  "city": "Delhi"},
    {"name": "Nagada Dhol Group",     "type": "Folk",    "min_fee": 40000,   "max_fee": 120000,  "city": "Ahmedabad"},
    {"name": "Stand-up Comedian",     "type": "Anchor",  "min_fee": 100000,  "max_fee": 400000,  "city": "Bangalore"},
    {"name": "Fusion Band",           "type": "Band",    "min_fee": 250000,  "max_fee": 700000,  "city": "Hyderabad"},
    {"name": "Puppet Show Artist",    "type": "Folk",    "min_fee": 20000,   "max_fee": 60000,   "city": "Jaipur"},
    {"name": "Fire Dance Troupe",     "type": "Group",   "min_fee": 80000,   "max_fee": 200000,  "city": "Goa"},
]

# F&B rates: (meal_type, tier, occasion, per_head_cost)
FB_RATES = [
    # veg
    ("veg", "basic",    "breakfast", 150),
    ("veg", "basic",    "lunch",     400),
    ("veg", "basic",    "dinner",    500),
    ("veg", "basic",    "snacks",    100),
    ("veg", "standard", "breakfast", 250),
    ("veg", "standard", "lunch",     650),
    ("veg", "standard", "dinner",    850),
    ("veg", "standard", "snacks",    175),
    ("veg", "premium",  "breakfast", 400),
    ("veg", "premium",  "lunch",     1000),
    ("veg", "premium",  "dinner",    1400),
    ("veg", "premium",  "snacks",    300),
    # non_veg
    ("non_veg", "basic",    "breakfast", 200),
    ("non_veg", "basic",    "lunch",     500),
    ("non_veg", "basic",    "dinner",    650),
    ("non_veg", "basic",    "snacks",    125),
    ("non_veg", "standard", "breakfast", 300),
    ("non_veg", "standard", "lunch",     800),
    ("non_veg", "standard", "dinner",    1100),
    ("non_veg", "standard", "snacks",    200),
    ("non_veg", "premium",  "breakfast", 500),
    ("non_veg", "premium",  "lunch",     1200),
    ("non_veg", "premium",  "dinner",    1700),
    ("non_veg", "premium",  "snacks",    350),
    # jain
    ("jain", "basic",    "breakfast", 150),
    ("jain", "basic",    "lunch",     380),
    ("jain", "basic",    "dinner",    480),
    ("jain", "basic",    "snacks",    100),
    ("jain", "standard", "breakfast", 250),
    ("jain", "standard", "lunch",     600),
    ("jain", "standard", "dinner",    800),
    ("jain", "standard", "snacks",    160),
    ("jain", "premium",  "breakfast", 400),
    ("jain", "premium",  "lunch",     950),
    ("jain", "premium",  "dinner",    1300),
    ("jain", "premium",  "snacks",    280),
]

# Logistics: (city, service_type, unit_cost)
LOGISTICS = [
    ("Mumbai",    "ghodi",             25000),
    ("Mumbai",    "dholi",              8000),
    ("Mumbai",    "transfer_per_trip",  4500),
    ("Delhi",     "ghodi",             20000),
    ("Delhi",     "dholi",              6000),
    ("Delhi",     "transfer_per_trip",  3500),
    ("Bangalore", "ghodi",             18000),
    ("Bangalore", "dholi",              5500),
    ("Bangalore", "transfer_per_trip",  3200),
    ("Chennai",   "ghodi",             15000),
    ("Chennai",   "dholi",              5000),
    ("Chennai",   "transfer_per_trip",  3000),
    ("Hyderabad", "ghodi",             16000),
    ("Hyderabad", "dholi",              5200),
    ("Hyderabad", "transfer_per_trip",  3100),
    ("Kolkata",   "ghodi",             14000),
    ("Kolkata",   "dholi",              4800),
    ("Kolkata",   "transfer_per_trip",  2800),
    ("Pune",      "ghodi",             17000),
    ("Pune",      "dholi",              5500),
    ("Pune",      "transfer_per_trip",  3200),
    ("Jaipur",    "ghodi",             18000),
    ("Jaipur",    "dholi",              6000),
    ("Jaipur",    "transfer_per_trip",  3500),
    ("Ahmedabad", "ghodi",             16000),
    ("Ahmedabad", "dholi",              5000),
    ("Ahmedabad", "transfer_per_trip",  3000),
    ("Surat",     "ghodi",             15000),
    ("Surat",     "dholi",              4800),
    ("Surat",     "transfer_per_trip",  2900),
    ("Default",   "ghodi",             15000),
    ("Default",   "dholi",              5000),
    ("Default",   "transfer_per_trip",  3500),
]

# RL training samples: (category, estimated, actual)
RL_TRAINING_SAMPLES = [
    ("Venue",                    800000,   920000),
    ("Venue",                   1200000,  1350000),
    ("Venue",                    500000,   580000),
    ("Food & Beverages",         600000,   670000),
    ("Food & Beverages",        1000000,  1120000),
    ("Food & Beverages",         400000,   440000),
    ("Decor & Design",           350000,   420000),
    ("Decor & Design",           700000,   810000),
    ("Decor & Design",           200000,   230000),
    ("Artists & Entertainment",  300000,   290000),
    ("Artists & Entertainment",  800000,   780000),
    ("Artists & Entertainment",  150000,   160000),
    ("Logistics & Transport",     80000,    95000),
    ("Logistics & Transport",    120000,   140000),
    ("Logistics & Transport",     50000,    58000),
]

ADMIN_SETTINGS = [
    ("contingency_pct",       "0.08"),
    ("weekend_surcharge_pct", "0.15"),
]


def seed():
    """Seed all tables if they are empty."""
    db = SessionLocal()
    try:
        # Artists
        count = db.execute(select(func.count()).select_from(Artist)).scalar()
        if count == 0:
            db.add_all([Artist(**a) for a in ARTISTS])

        # F&B rates
        count = db.execute(select(func.count()).select_from(FBRate)).scalar()
        if count == 0:
            db.add_all([
                FBRate(meal_type=mt, tier=tier, occasion=occ, per_head_cost=cost)
                for mt, tier, occ, cost in FB_RATES
            ])

        # Logistics
        count = db.execute(select(func.count()).select_from(LogisticsCost)).scalar()
        if count == 0:
            db.add_all([
                LogisticsCost(city=city, service_type=svc, unit_cost=cost, unit="per_event")
                for city, svc, cost in LOGISTICS
            ])

        # Admin settings
        count = db.execute(select(func.count()).select_from(AdminSetting)).scalar()
        if count == 0:
            db.add_all([AdminSetting(key=k, value=v) for k, v in ADMIN_SETTINGS])

        db.commit()
        print("[OK] Seed data inserted.")
    finally:
        db.close()

    # RL training — run outside the main session
    db = SessionLocal()
    try:
        count = db.execute(select(func.count()).select_from(RLTrainingLog)).scalar()
    finally:
        db.close()

    if count == 0:
        from ml.rl_agent import get_rl_agent
        agent = get_rl_agent()
        db = SessionLocal()
        try:
            agent.load_state(db)
        finally:
            db.close()
        for category, estimated, actual in RL_TRAINING_SAMPLES:
            db = SessionLocal()
            try:
                agent.update(category=category, estimated=estimated, actual=actual, db=db)
                db.commit()
            finally:
                db.close()
        print(f"[OK] RL agent seeded with {len(RL_TRAINING_SAMPLES)} training samples.")
    else:
        print(f"[--] RL training log already has {count} entries, skipping.")


if __name__ == "__main__":
    create_all()
    seed()
