"""
Job description NLP parser.
Extracts: required skills, experience level, salary range.
Uses spaCy (already installed) + regex patterns.
"""
import re
import spacy
from typing import Optional

# Load model lazily to avoid startup cost
_nlp = None

def get_nlp():
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load('en_core_web_sm')
        except Exception:
            _nlp = None
    return _nlp

EXP_PATTERNS = [
    r'(\d+)\+?\s*(?:to\s*(\d+))?\s*years?\s*(?:of\s*)?(?:experience|exp)',
]
SALARY_PATTERNS = [
    r'\$([\d,]+)\s*(?:to|-|\u2013)\s*\$?([\d,]+)',
    r'([\d,]+)k?\s*(?:to|-|\u2013)\s*([\d,]+)k?\s*(?:USD|usd|per year|annually)',
]
SKILL_KEYWORDS = [
    'python', 'javascript', 'typescript', 'react', 'node', 'aws', 'docker',
    'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql', 'redis', 'graphql',
    'rest', 'fastapi', 'django', 'flask', 'java', 'kotlin', 'swift', 'go',
    'machine learning', 'deep learning', 'nlp', 'data science', 'spark',
    'tableau', 'powerbi', 'excel', 'figma', 'sketch', 'photoshop',
    'project management', 'agile', 'scrum', 'jira', 'leadership',
]

def parse_job_description(text: str) -> dict:
    text_lower = text.lower()
    
    # Skills
    found_skills = [s for s in SKILL_KEYWORDS if s in text_lower]
    
    # Experience
    exp_min, exp_max = None, None
    for pat in EXP_PATTERNS:
        m = re.search(pat, text_lower)
        if m:
            try:
                exp_min = int(m.group(1))
                exp_max = int(m.group(2)) if m.group(2) else exp_min
                break
            except (ValueError, TypeError):
                pass
    
    # Salary
    salary_min, salary_max, currency = None, None, 'USD'
    for pat in SALARY_PATTERNS:
        m = re.search(pat, text.replace(',', ''))
        if m:
            try:
                salary_min = float(m.group(1))
                salary_max = float(m.group(2))
                if salary_min < 1000:
                    salary_min *= 1000
                    salary_max *= 1000
                break
            except (ValueError, TypeError):
                pass
    
    return {
        'skills': found_skills,
        'experience_min_years': exp_min,
        'experience_max_years': exp_max,
        'salary_min': salary_min,
        'salary_max': salary_max,
        'currency': currency,
    }
