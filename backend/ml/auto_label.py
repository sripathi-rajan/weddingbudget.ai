"""Auto-label all images in decor_dataset using MobileNetV2 embeddings + KMeans clustering.

Run on startup (via main.py) when fewer than 200 labelled images exist.
Can also be run standalone: python ml/auto_label.py
"""
import csv
import os
import sys
import numpy as np
from typing import Any

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

IMAGES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "decor_dataset", "data", "images"))
LABELS_CSV = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "decor_dataset", "data", "labels.csv"))

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

FOLDER_BASE_RANGES = {
    "entrance":  (30000,   500000),
    "mandap":    (200000,  5000000),
    "stage":     (150000,  4000000),
    "backdrop":  (20000,   800000),
    "ceiling":   (60000,   1500000),
    "table":     (8000,    200000),
    "lighting":  (10000,   400000),
    "floral":    (15000,   800000),
    "default":   (20000,   1000000),
}

COMPLEXITY_MULTIPLIERS = {
    1: 0.35,
    2: 0.60,
    3: 1.00,
    4: 1.75,
    5: 3.00,
}

STYLE_MULTIPLIERS = {
    "Luxury":       1.5,
    "Romantic":     1.2,
    "Traditional":  1.0,
    "Modern":       1.1,
    "Minimalist":   0.7,
    "Boho":         0.85,
}

# KMeans cluster → style mapping (fixed assignment)
CLUSTER_STYLE_MAP = {
    0: "Traditional",
    1: "Romantic",
    2: "Modern",
    3: "Minimalist",
    4: "Luxury",
    5: "Boho",
}

FIELDNAMES = ["filename", "function_type", "style", "complexity", "seed_cost"]


def _collect_images() -> list[tuple[str, str, str]]:
    """Return list of (unique_filename, subfolder, abs_path) for all images."""
    items = []
    if not os.path.isdir(IMAGES_DIR):
        return items
    for subfolder in sorted(os.listdir(IMAGES_DIR)):
        subfolder_path = os.path.join(IMAGES_DIR, subfolder)
        if not os.path.isdir(subfolder_path):
            continue
        for fname in sorted(os.listdir(subfolder_path)):
            ext = os.path.splitext(fname)[1].lower()
            if ext not in IMAGE_EXTENSIONS:
                continue
            unique_filename = f"{subfolder}/{fname}"
            abs_path = os.path.join(subfolder_path, fname)
            items.append((unique_filename, subfolder, abs_path))
    return items


def _extract_mobilenet_embeddings(image_paths: list[str]) -> "np.ndarray":
    """Extract 1280-dim MobileNetV2 global_average_pooling embeddings."""
    try:
        from tensorflow.keras.applications import MobileNetV2  # type: ignore
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input  # type: ignore
        from tensorflow.keras.models import Model  # type: ignore
    except ImportError:
        # Fallback for environments where tensorflow is not installed
        # (e.g. Python 3.14 where TF is not yet available)
        raise ImportError("tensorflow is required for _extract_mobilenet_embeddings. Please install it with 'pip install tensorflow'.")

    from PIL import Image

    base = MobileNetV2(weights="imagenet", include_top=False, pooling="avg", input_shape=(224, 224, 3))

    embeddings = []
    for path in image_paths:
        try:
            img = Image.open(path).convert("RGB").resize((224, 224))
            arr = preprocess_input(
                np.array(img, dtype="float32")[None]
            )
            emb = base.predict(arr, verbose=0)[0]
        except Exception:
            emb = np.zeros(1280, dtype="float32")
        embeddings.append(emb)
    return np.array(embeddings, dtype="float32")


def _infer_complexity_from_score(complexity_score: float) -> int:
    """Map extract_features()[10] complexity_score to 1-5 complexity level."""
    if complexity_score < 0.1:
        return 1
    if complexity_score < 0.2:
        return 2
    if complexity_score < 0.3:
        return 3
    if complexity_score < 0.4:
        return 4
    return 5


def _read_labels() -> dict:
    labels = {}
    if not os.path.exists(LABELS_CSV):
        return labels
    with open(LABELS_CSV, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            labels[row["filename"]] = row
    return labels


def _write_labels(labels: dict):
    os.makedirs(os.path.dirname(LABELS_CSV), exist_ok=True)
    with open(LABELS_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        for row in labels.values():
            writer.writerow({k: row.get(k, "") for k in FIELDNAMES})


def run_auto_label(force: bool = False) -> int:
    """Auto-label all images using MobileNetV2 + KMeans(k=6).

    Returns number of images newly labelled.
    Skips re-labelling if labels >= 200 and not forced.
    """
    from sklearn.cluster import KMeans
    from ml.decor_features import extract_features

    items = _collect_images()
    if not items:
        return 0

    existing = _read_labels()
    if not force and len(existing) >= 999:
        return 0

    image_paths = [abs_path for _, _, abs_path in items]

    # Extract MobileNetV2 embeddings for all images
    # Check for RENDER environnement to avoid OOM on tiny instances
    if os.environ.get("RENDER"):
        import logging
        logging.warning("Auto-labeling skipped on Render to save memory. Use local CLI or Admin Panel to label images.")
        return 0

    embeddings = _extract_mobilenet_embeddings(image_paths)

    # Cluster into 6 styles
    kmeans = KMeans(n_clusters=6, random_state=42, n_init=10)
    cluster_ids = kmeans.fit_predict(embeddings)

    labels = dict(existing)  # preserve any existing manual labels
    rng = np.random.default_rng(seed=0)
    labelled = 0

    for (unique_filename, subfolder, abs_path), cluster_id in zip(items, cluster_ids):
        function_type = subfolder.lower()
        style = CLUSTER_STYLE_MAP[int(cluster_id)]

        try:
            feats = extract_features(abs_path)
            complexity_score = float(feats[10])
        except Exception:
            complexity_score = 0.25
        complexity = _infer_complexity_from_score(complexity_score)

        import random
        low, high = FOLDER_BASE_RANGES.get(function_type, FOLDER_BASE_RANGES["default"])
        base = random.uniform(low, high)
        cost = base * COMPLEXITY_MULTIPLIERS[complexity] * STYLE_MULTIPLIERS[style]
        seed_cost = int(round(cost, -3))

        labels[unique_filename] = {
            "filename":      unique_filename,
            "function_type": function_type,
            "style":         style,
            "complexity":    str(complexity),
            "seed_cost":     str(seed_cost),
        }
        labelled += 1

    _write_labels(labels)
    return labelled


def maybe_auto_label() -> int:
    """Called on startup: auto-label if fewer than 200 labelled images exist.

    Returns count of newly labelled images.
    """
    import logging
    labels = _read_labels()
    if len(labels) >= 999:
        return 0
    count = run_auto_label()
    if count > 0:
        logging.getLogger(__name__).info(
            "auto_label: labelled %d images (total now %d)", count, len(_read_labels())
        )
    return count


if __name__ == "__main__":
    force = "--force" in sys.argv
    n = run_auto_label(force=force)
    print(f"Auto-labelled {n} images. Total: {len(_read_labels())}")
