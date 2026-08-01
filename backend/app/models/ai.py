from datetime import datetime
from typing import List
from pydantic import Field
from beanie import Document

class PromptTemplate(Document):
    name: str
    description: str
    template_text: str
    variables: List[str]
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "prompt_templates"
