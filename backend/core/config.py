import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Literacy Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Using SQLite for local development by default. Can be overridden with Postgres URL.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./literacy.db")
    
    # LLM API KEY
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")

    class Config:
        case_sensitive = True

settings = Settings()
