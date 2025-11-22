import os
import sys
from pathlib import Path

# Make sure Python can import from the backend root
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from main import app as fastapi_app  # import your existing FastAPI app

# Vercel expects an ASGI app exposed as "app"
app = fastapi_app
