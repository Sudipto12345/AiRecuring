SKILL_VOCAB = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby",
    "Kotlin", "Swift", "Dart", "Scala", "R", "MATLAB",
    "React", "Next.js", "Vue", "Angular", "Svelte", "Redux", "Tailwind", "HTML", "CSS", "SASS",
    "Node.js", "Express.js", "NestJS", "Django", "Flask", "FastAPI", "Spring", "Laravel", ".NET",
    "GraphQL", "REST API", "gRPC", "WebSockets",
    "SQL", "NoSQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "SQLite", "Cassandra", "DynamoDB",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible", "CI/CD", "Jenkins",
    "GitHub Actions", "Linux", "Nginx", "Kafka", "RabbitMQ",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy",
    "NLP", "Computer Vision", "OpenCV", "LLM", "Data Analysis", "Power BI", "Tableau", "Excel",
    "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "UI Design", "UX Research", "Prototyping",
    "Wireframing", "Design Systems",
    "Agile", "Scrum", "Jira", "Roadmap", "Product Strategy", "Stakeholder Management", "Analytics",
    "Selenium", "Cypress", "Playwright", "Postman", "JUnit", "PyTest",
    "Git", "Microservices", "System Design", "OOP", "Data Structures", "Algorithms",
    "SEO", "Content Writing", "Copywriting", "Technical Writing",
    "Flutter", "React Native", "Android", "iOS",
]

# Some skills are commonly written in multiple ways.
SKILL_ALIASES = {
    "node": "Node.js",
    "nodejs": "Node.js",
    "node js": "Node.js",
    "nextjs": "Next.js",
    "next js": "Next.js",
    "reactjs": "React",
    "react.js": "React",
    "expressjs": "Express.js",
    "postgres": "PostgreSQL",
    "psql": "PostgreSQL",
    "ts": "TypeScript",
    "js": "JavaScript",
    "ml": "Machine Learning",
    "k8s": "Kubernetes",
    "tf": "TensorFlow",
}


def normalize_skill(token: str) -> str | None:
    key = token.strip().lower()
    if key in SKILL_ALIASES:
        return SKILL_ALIASES[key]
    for skill in SKILL_VOCAB:
        if skill.lower() == key:
            return skill
    return None
