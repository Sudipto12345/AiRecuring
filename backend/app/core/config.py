from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "airecruit"

    jwt_secret: str = "change-me"
    jwt_alg: str = "HS256"
    access_token_ttl_min: int = 60 * 24 * 30

    superadmin_email: str = "owner@airecruit.io"
    superadmin_password: str = "owner12345"
    superadmin_name: str = "Platform Owner"

    frontend_origin: str = "http://localhost:3000"

    # Dev mode exposes demo accounts + a public service-health probe on the login page.
    dev_mode: bool = True

    llm_provider: str = "bedrock"
    llm_model: str = "anthropic.claude-3-5-sonnet-20240620-v1:0"
    openai_api_key: str = ""

    # AWS Credentials & Bedrock / S3 Settings
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    aws_bedrock_model: str = "anthropic.claude-3-5-sonnet-20240620-v1:0"
    aws_s3_bucket: str = "airecruit-storage"

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    mail_from: str = "noreply@airecruit.io"

    storage_dir: str = "storage"

    # Redis (cache / queue / rate-limit / OTP)
    redis_url: str = "redis://localhost:6379/0"

    # MinIO (object storage for files)
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "airecruit"
    minio_secret_key: str = "airecruit123"
    minio_bucket: str = "airecruit"
    minio_secure: bool = False

    # Qdrant (vector search)
    qdrant_url: str = "http://localhost:6333"
    embedding_model: str = "text-embedding-3-small"
    embedding_dim: int = 1536

    # Credits: 1 credit == $0.01. Local face analysis is free by default.
    credit_usd_per_credit: float = 0.01
    face_analysis_credits: int = 0
    new_company_credits: int = 500

    @property
    def storage_path(self) -> Path:
        p = Path(self.storage_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
