"""Image feature extraction for decor cost prediction using Pillow."""
import numpy as np
from PIL import Image


def extract_features(image_path: str) -> np.ndarray:
    """Extract a 19-value feature vector from a decor image.

    Features:
        0-8  : dominant_colors  — mean RGB of 3 image quadrants (9 values, normalised 0-1)
        9    : brightness       — mean pixel brightness (0-1)
        10   : complexity_score — std deviation of pixel values (0-1)
        11   : color_variance   — mean channel variance (0-1)
        12   : warm_ratio       — fraction of warm pixels (R>G and R>B)
        13   : dark_ratio       — fraction of dark pixels (mean brightness < 80)
        14   : aspect_ratio     — width / height
        15   : texture_score    — variance of Laplacian (edge sharpness, 0-1)
        16   : color_richness   — number of distinct color clusters / 64 (0-1)
        17   : brightness_zones — variance of mean brightness across 9 zones (0-1)
        18   : symmetry_score   — left/right half similarity (0=identical, 1=very different)
    """
    try:
        img = Image.open(image_path).convert("RGB")
        img_small = img.resize((64, 64))
        arr = np.array(img_small, dtype=np.float32)

        # dominant_colors: mean RGB of top-left, top-right, bottom-left quadrants
        h, w = arr.shape[:2]
        regions = [
            arr[: h // 2, : w // 2],
            arr[: h // 2, w // 2 :],
            arr[h // 2 :, : w // 2],
        ]
        dominant_colors = np.concatenate([r.mean(axis=(0, 1)) for r in regions]) / 255.0  # 9

        brightness = float(arr.mean() / 255.0)                                              # 1
        complexity_score = float(arr.std() / 255.0)                                         # 1
        color_variance = float(arr.reshape(-1, 3).var(axis=0).mean() / (255.0 ** 2))       # 1

        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        warm_ratio = float(((r > g) & (r > b)).mean())                                     # 1
        dark_ratio = float((arr.mean(axis=2) < 80).mean())                                 # 1

        orig_w, orig_h = img.size
        aspect_ratio = float(orig_w / orig_h) if orig_h > 0 else 1.0                      # 1

        # texture_score: variance of Laplacian approximation (edge sharpness)
        gray = arr.mean(axis=2)
        # Simple Laplacian via finite differences
        lap = (
            np.roll(gray, 1, axis=0) + np.roll(gray, -1, axis=0) +
            np.roll(gray, 1, axis=1) + np.roll(gray, -1, axis=1) -
            4 * gray
        )
        texture_score = float(np.clip(lap.var() / (255.0 ** 2), 0, 1))                    # 1

        # color_richness: distinct color clusters via quantisation to 4-bit per channel
        quantised = (arr / 16).astype(np.uint8)
        unique_colors = len(np.unique(quantised.reshape(-1, 3), axis=0))
        color_richness = float(min(unique_colors / 64.0, 1.0))                             # 1

        # brightness_zones: 3×3 grid zone brightness variance
        zh, zw = h // 3, w // 3
        zone_means = []
        for zi in range(3):
            for zj in range(3):
                zone = gray[zi * zh:(zi + 1) * zh, zj * zw:(zj + 1) * zw]
                zone_means.append(zone.mean())
        brightness_zones = float(np.clip(np.var(zone_means) / (255.0 ** 2), 0, 1))        # 1

        # symmetry_score: mean absolute difference between left and right halves
        left = gray[:, : w // 2]
        right = np.fliplr(gray[:, w - w // 2 :])
        min_w = min(left.shape[1], right.shape[1])
        symmetry_score = float(np.abs(left[:, :min_w] - right[:, :min_w]).mean() / 255.0) # 1

        features = np.concatenate([
            dominant_colors,
            [brightness, complexity_score, color_variance, warm_ratio, dark_ratio,
             aspect_ratio, texture_score, color_richness, brightness_zones, symmetry_score],
        ])
        return features.astype(np.float32)

    except Exception:
        return np.zeros(19, dtype=np.float32)
