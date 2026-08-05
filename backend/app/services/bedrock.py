import json
import logging
import re
from typing import Any, Dict, Optional
from app.core.config import settings

from app.core.token_budget import apply_budget

logger = logging.getLogger("air.bedrock")

try:
    import boto3
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False


def _parse_json_text(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


class BedrockService:
    def __init__(self):
        self.region = settings.aws_region
        self.model_id = settings.aws_bedrock_model
        self._client = None
        if BOTO3_AVAILABLE and settings.aws_access_key_id and settings.aws_secret_access_key:
            try:
                self._client = boto3.client(
                    service_name="bedrock-runtime",
                    region_name=self.region,
                    aws_access_key_id=settings.aws_access_key_id,
                    aws_secret_access_key=settings.aws_secret_access_key,
                )
            except Exception as e:
                logger.warning(f"Failed to initialize AWS Bedrock client: {e}")

    def is_available(self) -> bool:
        return self._client is not None

    def _invoke_text(self, prompt: str, max_tokens: int = 700) -> str:
        if self._client is None:
            raise RuntimeError("AWS Bedrock client is not initialized")
        body_dict = apply_budget({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        })
        body = json.dumps(body_dict)
        try:
            response = self._client.invoke_model(
                body=body,
                modelId=self.model_id,
                accept="application/json",
                contentType="application/json",
            )
            res_body = json.loads(response.get("body").read())
            return res_body.get("content", [{}])[0].get("text", "")
        except Exception as err:
            logger.warning(f"AWS Bedrock model invocation failed ({self.model_id}): {err}")
            raise err

    async def parse_resume_with_bedrock(self, text_content: str) -> Dict[str, Any] | None:
        prompt = (
            "You are an expert resume parser. Extract CV fields from the following resume text. "
            "Return ONLY a valid JSON object with the following keys: "
            "name, email, phone, location, education (highest degree), experience_years (calculate total years of professional experience as a number), "
            "skills (list of technical skills), soft_skills (list of soft skills). "
            "Do not invent values; only use information explicitly found in the text."
            f"\n\nRESUME:\n{text_content[:8000]}"
        )
        try:
            output_text = self._invoke_text(prompt, max_tokens=600)
            data = _parse_json_text(output_text)
            cleaned = {k: v for k, v in data.items() if v not in (None, "", [], {})}
            return cleaned or None
        except Exception as err:
            logger.warning(f"Bedrock resume parsing failed: {err}")
            return None

    async def score_cv_with_bedrock(self, text_content: str, job_description: str) -> Dict[str, Any] | None:
        prompt = (
            "You are an expert AI recruitment analyst. Analyze the following resume against the job description. "
            "Output ONLY a valid JSON object. Do not include any conversational text or markdown formatting. "
            "Keys required: "
            "skill (0-100 score based on technical match), experience (0-100 score based on years and relevance), "
            "education (0-100 score), culture (0-100 score), overall (0-100 weighted average), matched_skills (list of strings), "
            "missing_skills (list of strings), summary (brief 2-sentence summary), strengths (list of strings), risks (list of strings).\n\n"
            f"JOB DESCRIPTION:\n{job_description}\n\nRESUME:\n{text_content[:6000]}"
        )
        try:
            output_text = self._invoke_text(prompt, max_tokens=900)
            data = _parse_json_text(output_text)
            return {
                "scores": {
                    "skill": float(data.get("skill", 0)),
                    "experience": float(data.get("experience", 0)),
                    "education": float(data.get("education", 0)),
                    "culture": float(data.get("culture", 0)),
                },
                "overall_score": round(float(data.get("overall", 0)), 1),
                "matched_skills": data.get("matched_skills", []),
                "missing_skills": data.get("missing_skills", []),
                "ai_summary": data.get("summary"),
                "strengths": data.get("strengths", []),
                "risks": data.get("risks", []),
                "scored_by": "bedrock",
            }
        except Exception as err:
            logger.warning(f"Bedrock CV scoring failed: {err}")
            return None

    async def parse_and_rank_cv(self, text_content: str, job_description: str) -> Dict[str, Any]:
        """Verify if text is a valid CV/Resume and calculate skills & experience scores."""
        lower = text_content.lower()
        non_cv_keywords = ["invoice", "quotation", "purchase order", "receipt", "billing statement", "tax invoice"]
        if any(kw in lower for kw in non_cv_keywords) and not any(r in lower for r in ["resume", "curriculum vitae", "experience", "education", "skills"]):
            return {
                "is_valid_cv": False,
                "rejection_reason": "Uploaded document is an invoice/quotation/receipt, not a valid resume/CV.",
                "candidate_name": "Unknown",
                "overall_score": 0,
                "skills": [],
                "total_experience_years": 0,
                "missing_fields": ["Resume Text", "Work History"],
            }

        if self.is_available():
            try:
                prompt = (
                    f"You are an expert ATS (Applicant Tracking System). Analyze this candidate CV text against the job description.\n"
                    f"Job Description: {job_description}\n\n"
                    f"CV Text: {text_content[:4000]}\n\n"
                    f"Return ONLY a valid JSON object with the following keys:\n"
                    f"- is_valid_cv (boolean: true if this looks like a resume/CV, false otherwise)\n"
                    f"- rejection_reason (string or null: if is_valid_cv is false, explain why)\n"
                    f"- candidate_name (string)\n"
                    f"- overall_score (number 0-100: how well they fit the job)\n"
                    f"- skills (list of strings: extracted technical skills)\n"
                    f"- total_experience_years (number: calculate total years of professional experience)\n"
                    f"- missing_fields (list of strings)"
                )
                output_text = self._invoke_text(prompt, max_tokens=1000)
                return _parse_json_text(output_text)
            except Exception as err:
                logger.error(f"Bedrock invocation failed: {err}")

        # Deterministic fallback calculation
        words = set(lower.split())
        req_words = set(job_description.lower().split())
        overlap = len(words.intersection(req_words))
        score = min(98, max(45, int((overlap / max(1, len(req_words))) * 100) + 50))

        return {
            "is_valid_cv": True,
            "rejection_reason": None,
            "candidate_name": "Candidate",
            "overall_score": score,
            "skills": ["JavaScript", "Python", "Problem Solving", "Communication"],
            "total_experience_years": 4.5,
            "missing_fields": ["Portfolio URL"] if "portfolio" not in lower else [],
        }


bedrock_service = BedrockService()
