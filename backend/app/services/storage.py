import mimetypes
import uuid
from pathlib import Path

from app.core.config import settings
from app.db.minio import put_object


def save_upload(company_id: str, scope: str, filename: str, data: bytes) -> str:
    # writes under storage/<company>/… and tries minio in the background
    safe = Path(filename).name
    folder = settings.storage_path / company_id / scope
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / f"{uuid.uuid4().hex}_{safe}"
    target.write_bytes(data)

    # minio mirror — fine if it fails
    key = str(target.relative_to(settings.storage_path))
    content_type = mimetypes.guess_type(safe)[0]
    put_object(key, data, content_type)

    return str(target)
