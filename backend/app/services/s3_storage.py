import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("air.s3")

try:
    import boto3
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False


class S3StorageService:
    def __init__(self):
        self.bucket = settings.aws_s3_bucket
        self.region = settings.aws_region
        self._s3_client = None
        if BOTO3_AVAILABLE and settings.aws_access_key_id and settings.aws_secret_access_key:
            try:
                self._s3_client = boto3.client(
                    "s3",
                    region_name=self.region,
                    aws_access_key_id=settings.aws_access_key_id,
                    aws_secret_access_key=settings.aws_secret_access_key,
                )
            except Exception as e:
                logger.warning(f"S3 client initialization warning: {e}")

    def is_configured(self) -> bool:
        return self._s3_client is not None

    async def upload_file(self, file_bytes: bytes, file_key: str, content_type: str = "application/octet-stream") -> str:
        """Upload file to AWS S3 bucket and return object URL."""
        if self.is_configured():
            try:
                self._s3_client.put_object(
                    Bucket=self.bucket,
                    Key=file_key,
                    Body=file_bytes,
                    ContentType=content_type,
                )
                return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{file_key}"
            except Exception as err:
                logger.error(f"AWS S3 upload error: {err}")

        # Local storage fallback URL
        return f"/storage/{file_key}"

    async def delete_file(self, file_key: str) -> bool:
        """Delete object from AWS S3."""
        if self.is_configured():
            try:
                self._s3_client.delete_object(Bucket=self.bucket, Key=file_key)
                return True
            except Exception as err:
                logger.error(f"AWS S3 delete error: {err}")
                return False
        return True


s3_storage_service = S3StorageService()
