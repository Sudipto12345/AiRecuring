# Mock ESCO (European Skills, Competences, Qualifications and Occupations) API
# In a real scenario, this would query an external taxonomy service.

MOCK_ESCO_TAXONOMY = [
    "python", "javascript", "typescript", "react", "node", "aws", "docker",
    "kubernetes", "sql", "nosql", "mongodb", "postgresql", "redis", "graphql",
    "rest", "fastapi", "django", "flask", "java", "kotlin", "swift", "go",
    "machine learning", "deep learning", "nlp", "data science", "spark",
    "tableau", "powerbi", "excel", "figma", "sketch", "photoshop",
    "project management", "agile", "scrum", "jira", "leadership",
    "c++", "c#", "ruby", "php", "html", "css", "vue", "angular",
    "ci/cd", "jenkins", "gitlab", "terraform", "ansible",
    "communication", "teamwork", "problem solving", "critical thinking",
    "data analysis", "cloud computing", "cybersecurity", "devops",
    "scrum master", "product management", "ux design", "ui design"
]

def fetch_esco_skills() -> list[str]:
    """Mock API call to fetch ESCO skill taxonomy."""
    return MOCK_ESCO_TAXONOMY
