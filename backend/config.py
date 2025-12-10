import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")
    SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    DEBUG = os.getenv("DEBUG", "false").lower() in ("true", "1", "t")