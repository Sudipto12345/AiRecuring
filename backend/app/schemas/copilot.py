from pydantic import BaseModel, Field


class CopilotRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    action: str = "chat"  # chat | generate_jd | summarize_resume | compare_candidates | generate_report | ask_data


class CopilotResponse(BaseModel):
    reply: str
    used_llm: bool
    tokens: int = 0
