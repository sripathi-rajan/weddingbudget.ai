import sys
import os
sys.path.append(os.getcwd())
from main import app

for route in app.routes:
    print(f"{route.path} {route.methods}")
