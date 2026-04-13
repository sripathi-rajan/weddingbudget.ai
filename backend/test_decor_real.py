import sys, os
sys.path.insert(0, os.getcwd())
from ml.decor_model import get_predictor, REALISTIC_BOUNDS
import io

# Set encoding explicitly to avoid charmap errors
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf8')

predictor = get_predictor()

# Mock validation strictness for tests
predictor._validate_image_strict = lambda img: (True, 0.90)

IMAGE_DIR = 'decor_dataset/data/images'
tests = [
    ('table', 'table'),
    ('entrance', 'entrance'),
    ('mandap', 'mandap'),
    ('floral', 'floral'),
]

for folder, cat in tests:
    folder_path = os.path.join(IMAGE_DIR, folder)
    if os.path.exists(folder_path):
        imgs = os.listdir(folder_path)
        if imgs:
            img_path = os.path.join(folder_path, imgs[0])
            result = predictor.predict(img_path, function_type=cat)
            bounds = REALISTIC_BOUNDS.get(cat)
            print(f'{cat}: INR {result["predicted_low"]:,.0f} - INR {result["predicted_high"]:,.0f} | {result["confidence"]} conf')
            print(f'  Expected range: INR {bounds[0]:,.0f} - INR {bounds[1]:,.0f}')
            within = bounds[0] <= result['predicted_mid'] <= bounds[1]
            print(f'  Within bounds: {"PASS" if within else "FAIL"}')
