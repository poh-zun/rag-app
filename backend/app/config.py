from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    chroma_persist_dir: str = "./chroma_db"
    upload_dir: str = "./uploads"
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k_results: int = 4

    class Config:
        env_file = ".env"


settings = Settings()
