from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "TimeBank API"
    database_url: str = "sqlite:///./timebank.db"
    secret_key: str = "development-only-change-me"
    access_token_expire_minutes: int = 60
    frontend_url: str = "http://localhost:5173"
    seed_demo: bool = False
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
