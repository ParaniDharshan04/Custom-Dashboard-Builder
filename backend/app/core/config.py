from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from dotenv import load_dotenv
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
load_dotenv(os.path.join(backend_dir, ".env"))

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5432/dashboard_db"
    SECRET_KEY: str = "your-secret-key"
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    GEMINI_API_KEY: str = ""
    GEMINI_API_KEYS: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
