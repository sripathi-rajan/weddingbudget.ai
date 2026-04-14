from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import wedding_config, budget, decor, food, artists, logistics, sundries, admin, payments, vendors, crm
import uvicorn, os


@asynccontextmanager
async def lifespan(app: FastAPI):
    import logging
    if not os.environ.get("DATABASE_URL"):
        logging.warning("WARNING: No DATABASE_URL set, using SQLite fallback")
    # Create tables and seed data on startup
    from database import create_all as _create_all, SessionLocal
    from seed_data import seed as _seed
    _create_all()
    _seed()

    from ml.import_images import import_images as _import_images
    _import_images()

    # Auto-label with MobileNetV2+KMeans if < 200 labels, then retrain model
    try:
        from ml.auto_label import maybe_auto_label, _read_labels
        if len(_read_labels()) < 200:
            newly_labelled = maybe_auto_label()
            if newly_labelled > 0:
                from ml.decor_model import get_predictor
                _p = get_predictor()
                _retrain = _p.train()
                logging.info(
                    "Auto-labelled %d images, model retrained (%s samples, accuracy=%s)",
                    newly_labelled,
                    _retrain.get("samples"),
                    _retrain.get("accuracy"),
                )
    except Exception as exc:
        logging.warning("Auto-label/retrain skipped: %s", exc)

    # Load RL Budget Agent
    try:
        from ml.rl_agent import get_rl_agent
        agent = get_rl_agent()
        with SessionLocal() as db:
            agent.load_state(db)
        total_rl = sum(agent.training_counts.values())
        cats_rl  = sum(1 for c in agent.training_counts.values() if c > 0)
        logging.info(f"RL Agent loaded ({total_rl} training samples across {cats_rl} categories)")
    except Exception as exc:
        logging.warning(f"RL Agent init skipped: {exc}")

    # Load Decor ML model (non-fatal if not trained yet)
    try:
        from ml.decor_model import get_predictor
        p = get_predictor()
        if p.model_mid is not None:
            logging.info(f"Decor ML model loaded ({p.n_samples} samples)")
        else:
            logging.info("Decor ML using rule-based fallback")
    except Exception as exc:
        logging.warning(f"Decor ML init skipped: {exc}")

    yield


app = FastAPI(title="weddingbudget.AI - Wedding Planner API", version="1.0.0", lifespan=lifespan)

# Allow any origin — Vercel frontend calls this Render backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wedding_config.router, prefix="/api/wedding",   tags=["Wedding Config"])
app.include_router(budget.router,         prefix="/api/budget",    tags=["Budget Engine"])
app.include_router(decor.router,          prefix="/api/decor",     tags=["Decor AI"])
app.include_router(food.router,           prefix="/api/food",      tags=["Food & Beverages"])
app.include_router(artists.router,        prefix="/api/artists",   tags=["Artists"])
app.include_router(logistics.router,      prefix="/api/logistics", tags=["Logistics"])
app.include_router(sundries.router,       prefix="/api/sundries",  tags=["Sundries"])
app.include_router(admin.router,          prefix="/api/admin",     tags=["Admin"])
app.include_router(payments.router,       prefix="/api/payments",  tags=["Payments"])
app.include_router(vendors.router,        prefix="/api/vendors",   tags=["Vendors"])
app.include_router(crm.router,            prefix="/api/admin/crm", tags=["CRM"])

# Serve decor images from the dataset.
# Keep both URL spellings for backwards compatibility.
_decor_images_dir = os.path.join(os.path.dirname(__file__), "decor_dataset", "data", "images")
app.mount("/decor-images", StaticFiles(directory=_decor_images_dir), name="decor-images")
app.mount("/decor_images", StaticFiles(directory=_decor_images_dir), name="decor-images-underscore")

# Serve vendor portfolio uploads
_uploads_dir = os.path.join(os.path.dirname(__file__), "static", "uploads")
os.makedirs(_uploads_dir, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=_uploads_dir), name="uploads")


@app.get("/")
def root():
    return {"message": "weddingbudget.AI Backend Running!", "docs": "/docs", "version": "1.0.0"}

@app.get("/health")
@app.get("/api/health")
def health():
    rl_info = {}
    try:
        from ml.rl_agent import get_rl_agent
        agent = get_rl_agent()
        rl_info = {
            "rl_agent_loaded":  True,
            "rl_total_samples": sum(agent.training_counts.values()),
        }
    except Exception:
        rl_info = {"rl_agent_loaded": False, "rl_total_samples": 0}

    decor_info = {}
    try:
        from ml.decor_model import get_predictor
        predictor = get_predictor()
        predictor._try_load()  # force reload from disk
        decor_info = {
            "decor_model_loaded":  predictor.model_mid is not None,
            "decor_model_samples": predictor.n_samples or 0,
        }
    except Exception:
        decor_info = {"decor_model_loaded": False, "decor_model_samples": 0}

    # Check database connection
    db_connected = False
    try:
        from database import SessionLocal
        with SessionLocal() as db:
            db.execute("SELECT 1")
        db_connected = True
    except Exception:
        db_connected = False

    # Count endpoints (rough estimate)
    total_endpoints = len(app.routes)

    return {
        "status": "ok",
        "version": "2.0.0",
        "db": "connected" if db_connected else "disconnected",
        **rl_info,
        **decor_info,
        "admin_panel": "active",
        "scraping_pipeline": "active",
        "total_endpoints": total_endpoints
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
