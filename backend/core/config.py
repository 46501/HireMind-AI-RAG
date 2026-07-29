from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerPilot AI"
    GEMINI_API_KEY: str = ""
    CHROMA_DB_DIR: str = "./chroma_db"

    class Config:
        env_file = ".env"

settings = Settings()
# Force uvicorn reload
