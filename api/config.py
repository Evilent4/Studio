import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent.parent
STORAGE_DIR = BASE_DIR / "storage"
DB_PATH = BASE_DIR / "studio.db"

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY") or None

STORAGE_DIR.mkdir(exist_ok=True)
