import re
from pathlib import Path

try:
    import spacy
except ImportError:
    spacy = None

from app.services.skills import SKILL_ALIASES, SKILL_VOCAB

# Attempt to load custom trained NLP CV model
NLP_MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "cv_nlp_model"
cv_nlp = None
if spacy and NLP_MODEL_PATH.exists():
    try:
        cv_nlp = spacy.load(NLP_MODEL_PATH)
    except Exception as e:
        print(f"Warning: Failed to load CV NLP model: {e}")

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
# International-friendly phone: optional +, country/area code, separators, 7-14 digits overall.
PHONE_RE = re.compile(r"(?<!\d)(\+?\d[\d\s().\-]{7,}\d)(?!\d)")
YEARS_RE = re.compile(r"(\d{1,2}(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b", re.IGNORECASE)
YEAR_SPAN_RE = re.compile(r"\b(19|20)\d{2}\s*(?:-|to|through|–)\s*(19|20)\d{2}\b")
YEAR_RANGE_RE = re.compile(r"\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}\b")
LINKEDIN_RE = re.compile(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[A-Za-z0-9_\-/%]+", re.IGNORECASE)
GITHUB_RE = re.compile(r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9_\-]+", re.IGNORECASE)

CV_HINTS = (
    "experience", "education", "skills", "summary", "profile",
    "work history", "employment", "projects", "education", "certifications",
    "objective", "professional summary", "career objective", "technologies",
)
NON_CV_HINTS = (
    "invoice", "quotation", "purchase order", "receipt", "billing statement",
    "tax invoice", "statement", "payment", "bank transfer", "account number",
)

# lines that look like section headers, not people
STOP_TITLES = {
    "curriculum vitae", "cv", "resume", "résumé", "resumé", "bio data", "biodata",
    "personal profile", "profile", "personal details", "personal information",
    "contact", "contact details", "contact information", "about me", "summary",
    "objective", "career objective", "professional summary",
}

NAME_LABEL_RE = re.compile(r"^\s*(?:name|full name)\s*[:\-]\s*(.+)$", re.IGNORECASE)
LOCATION_LABEL_RE = re.compile(
    r"^\s*(?:address|location|city|based in|residence|present address|mailing address)\s*[:\-]\s*(.+)$",
    re.IGNORECASE,
)

# Common countries to anchor an unlabelled location line.
COUNTRIES = [
    "bangladesh", "india", "pakistan", "nepal", "sri lanka", "united states", "usa", "u.s.a",
    "united kingdom", "uk", "canada", "australia", "germany", "france", "spain", "italy",
    "netherlands", "sweden", "norway", "denmark", "ireland", "singapore", "malaysia", "indonesia",
    "philippines", "vietnam", "thailand", "china", "japan", "south korea", "korea", "uae",
    "united arab emirates", "saudi arabia", "qatar", "kuwait", "turkey", "egypt", "nigeria",
    "kenya", "south africa", "brazil", "mexico", "argentina", "poland", "portugal", "switzerland",
    "austria", "belgium", "new zealand", "russia",
]

DEGREES = [
    ("ph.d", "PhD"), ("phd", "PhD"), ("doctorate", "PhD"), ("doctor of philosophy", "PhD"),
    ("m.b.a", "MBA"), ("mba", "MBA"),
    ("master of", "Master's"), ("masters", "Master's"), ("master's", "Master's"), ("master", "Master's"),
    ("m.sc", "Master's"), ("msc", "Master's"), ("m.s.", "Master's"), ("m.tech", "Master's"), ("m.a.", "Master's"),
    ("bachelor of", "Bachelor's"), ("bachelors", "Bachelor's"), ("bachelor's", "Bachelor's"), ("bachelor", "Bachelor's"),
    ("b.sc", "Bachelor's"), ("bsc", "Bachelor's"), ("b.s.", "Bachelor's"), ("b.tech", "Bachelor's"),
    ("b.eng", "Bachelor's"), ("b.a.", "Bachelor's"), ("undergraduate", "Bachelor's"),
    ("diploma", "Diploma"),
    ("higher secondary", "Higher Secondary"), ("hsc", "Higher Secondary"),
]


def extract_text(path: str, content_type: str | None) -> str:
    p = Path(path)
    suffix = p.suffix.lower()
    try:
        if suffix == ".pdf" or (content_type and "pdf" in content_type):
            import pdfplumber

            with pdfplumber.open(path) as pdf:
                return "\n".join((page.extract_text() or "") for page in pdf.pages)
        if suffix in (".docx",) or (content_type and "word" in (content_type or "")):
            import docx

            doc = docx.Document(path)
            return "\n".join(par.text for par in doc.paragraphs)
        return p.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        try:
            return p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return ""


def _looks_like_name(line: str) -> bool:
    if "@" in line or any(c.isdigit() for c in line):
        return False
    if line.lower().strip(" :-") in STOP_TITLES:
        return False
    words = line.split()
    if not (1 < len(words) <= 4):
        return False
    # Each token should be alphabetic (allow initials like "Md." or "A.").
    for w in words:
        token = w.strip(".")
        if not token.replace("-", "").replace("'", "").isalpha():
            return False
    # Accept Title Case or ALL CAPS names.
    title_case = all(w[0].isupper() for w in words if w[:1].isalpha())
    return title_case


def _clean_name(line: str) -> str:
    line = line.strip(" :-\t")
    # If ALL CAPS, convert to title case ("MD. RAFIQ HASAN" -> "Md. Rafiq Hasan").
    if line.isupper():
        line = line.title()
    return line


def looks_like_cv(text: str, filename: str) -> bool:
    low = text.lower()
    if any(term in low for term in NON_CV_HINTS):
        return False

    hint_hits = sum(1 for term in CV_HINTS if term in low)
    has_email = bool(EMAIL_RE.search(text))
    has_phone = bool(PHONE_RE.search(text))
    has_name = guess_name(text, filename) != "Unknown Candidate"
    has_experience = bool(YEARS_RE.search(text) or YEAR_RANGE_RE.search(text) or YEAR_SPAN_RE.search(text))
    has_skills = bool(detect_skills(text))

    return (hint_hits >= 2 or has_email or has_phone or has_experience) and (has_name or has_skills)


def guess_name(text: str, filename: str) -> str:
    lines = [ln.strip() for ln in text.splitlines()]

    # 1) Explicit "Name:" label anywhere near the top.
    for ln in lines[:25]:
        m = NAME_LABEL_RE.match(ln)
        if m:
            value = m.group(1).strip()
            if value and "@" not in value and not any(c.isdigit() for c in value):
                return _clean_name(value)

    # 2) First plausible name line in the header, skipping titles/headers.
    for ln in lines[:12]:
        if not ln:
            continue
        if _looks_like_name(ln):
            return _clean_name(ln)

    # 3) Fall back to the filename, stripping cv/resume noise.
    stem = Path(filename).stem.replace("_", " ").replace("-", " ").replace(".", " ")
    stem = re.sub(r"\b(cv|resume|résumé|curriculum vitae|curriculum|vitae|profile)\b", "", stem, flags=re.IGNORECASE)
    stem = re.sub(r"\s+", " ", stem).strip()
    return stem.title() if stem else "Unknown Candidate"


def detect_location(text: str) -> str | None:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]

    # 1) Labelled address/location.
    for ln in lines[:30]:
        m = LOCATION_LABEL_RE.match(ln)
        if m:
            value = m.group(1).strip(" ,;")
            value = EMAIL_RE.sub("", value).strip(" ,;|")
            if value:
                return value[:120]

    # 2) Unlabelled "City, Country" line anchored by a known country.
    for ln in lines[:20]:
        if "@" in ln or LINKEDIN_RE.search(ln) or GITHUB_RE.search(ln):
            continue
        low = ln.lower()
        if "," in ln and len(ln) <= 80 and any(country in low for country in COUNTRIES):
            return ln.strip(" ,;|")[:120]

    return None


def detect_skills(text: str) -> list[str]:
    low = f" {text.lower()} "
    found: list[str] = []
    for skill in SKILL_VOCAB:
        token = skill.lower()
        pattern = r"(?<![a-z0-9])" + re.escape(token) + r"(?![a-z0-9])"
        if re.search(pattern, low):
            found.append(skill)
    for alias, canonical in SKILL_ALIASES.items():
        pattern = r"(?<![a-z0-9])" + re.escape(alias) + r"(?![a-z0-9])"
        if canonical not in found and re.search(pattern, low):
            found.append(canonical)
    return found


def _detect_experience(text: str) -> float:
    matches = [float(m) for m in YEARS_RE.findall(text) if float(m) <= 45]
    if matches:
        return round(max(matches), 1)

    for match in YEAR_RANGE_RE.finditer(text):
        start = int(match.group(1))
        end = int(match.group(2))
        span = end - start
        if 0 < span <= 45:
            return float(span)

    for match in YEAR_SPAN_RE.finditer(text):
        start = int(match.group(1))
        end = int(match.group(2))
        span = end - start
        if 0 < span <= 45:
            return float(span)

    years = sorted(int(y) for y in re.findall(r"\b(?:19|20)\d{2}\b", text))
    if len(years) >= 2:
        span = years[-1] - years[0]
        if 0 < span <= 45:
            return float(span)
    return 0.0


def _detect_education(text: str) -> str | None:
    low = text.lower()
    for keyword, label in DEGREES:
        if keyword in low:
            return label
    return None


SOFT_SKILLS = [
    "communication", "leadership", "teamwork", "team work", "collaboration", "problem solving",
    "problem-solving", "adaptability", "creativity", "time management", "critical thinking",
    "analytical", "interpersonal", "presentation", "negotiation", "mentoring", "mentorship",
    "decision making", "attention to detail", "work ethic", "flexibility", "self-motivated",
    "organizational", "stakeholder",
]


def detect_soft_skills(text: str) -> list[str]:
    low = text.lower()
    found: list[str] = []
    for term in SOFT_SKILLS:
        if term in low:
            label = term.replace("-", " ").title()
            if label not in found:
                found.append(label)
    return found


def detect_links(text: str) -> dict:
    li = LINKEDIN_RE.search(text)
    gh = GITHUB_RE.search(text)
    return {
        "linkedin": li.group(0) if li else None,
        "github": gh.group(0) if gh else None,
    }


def parse_resume(text: str, filename: str) -> dict:
    email = EMAIL_RE.search(text)
    # Prefer a phone-looking match that has enough digits (>= 9).
    phone = None
    for m in PHONE_RE.finditer(text):
        digits = re.sub(r"\D", "", m.group(1))
        if 9 <= len(digits) <= 15:
            phone = m.group(1).strip()
            break

    links = detect_links(text)
    
    skills = detect_skills(text)
    education = _detect_education(text)
    experience_years = _detect_experience(text)

    # Use custom NLP model to augment extractions if available
    if cv_nlp:
        doc = cv_nlp(text)
        for ent in doc.ents:
            label = ent.label_
            val = ent.text.strip()
            if label == "SKILL" and val not in skills:
                skills.append(val)
            elif label == "EDUCATION" and not education:
                education = val
            elif label == "EXPERIENCE":
                # Very basic extraction: looking for numbers near the experience string
                nums = [int(s) for s in val.split() if s.isdigit()]
                if nums:
                    exp_val = max(nums)
                    if exp_val > experience_years:
                        experience_years = float(exp_val)

    return {
        "name": guess_name(text, filename),
        "email": email.group(0) if email else None,
        "phone": phone,
        "location": detect_location(text),
        "linkedin": links["linkedin"],
        "github": links["github"],
        "skills": skills,
        "soft_skills": detect_soft_skills(text),
        "experience_years": experience_years,
        "education": education,
    }
