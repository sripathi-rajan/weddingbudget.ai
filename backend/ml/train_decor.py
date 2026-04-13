"""Standalone training script: python ml/train_decor.py

Loads DB, trains DecorCostPredictor, prints accuracy and sample count.
Called by admin "Retrain Model" button via /api/admin/decor/retrain.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


def main():
    from database import create_all, SessionLocal
    from ml.decor_model import DecorCostPredictor

    create_all()

    db = SessionLocal()
    try:
        predictor = DecorCostPredictor()
        result = predictor.train(db)
    finally:
        db.close()

    if result["method"] == "rule-based":
        print(
            f"Not enough labelled images ({result['samples']}). "
            "Using rule-based fallback. Label at least 5 images via the admin panel."
        )
    else:
        print(
            f"Training complete! "
            f"Samples: {result['samples']}  "
            f"Test R² accuracy: {result['accuracy']}"
        )


if __name__ == "__main__":
    main()
