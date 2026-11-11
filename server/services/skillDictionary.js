// Controlled Skill Dictionary for SmartHire Recommendation Engine & Resume Parser
const SKILL_DICTIONARY = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'C#', 'Go', 'Golang',
  'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'HTML', 'HTML5', 'CSS', 'CSS3', 'R',

  // Frontend Technologies
  'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Svelte',
  'Redux', 'Zustand', 'Tailwind CSS', 'Tailwind', 'Bootstrap', 'Sass', 'SCSS',
  'Material-UI', 'MUI', 'Chakra UI', 'Webpack', 'Vite',

  // Backend Technologies
  'Node.js', 'Node', 'Express', 'Express.js', 'Nest.js', 'Django', 'FastAPI',
  'Flask', 'Spring Boot', 'Spring', 'ASP.NET', '.NET', 'Ruby on Rails', 'Koa',

  // Databases & Caching
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Oracle', 'Cassandra',
  'Elasticsearch', 'DynamoDB', 'Firebase', 'Supabase', 'Prisma', 'Mongoose',

  // Cloud & DevOps
  'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Docker',
  'Kubernetes', 'K8s', 'Terraform', 'CI/CD', 'GitHub Actions', 'Jenkins',
  'Linux', 'Nginx', 'Apache', 'Serverless', 'Vercel', 'Render',

  // APIs & Architecture
  'REST API', 'RESTful APIs', 'GraphQL', 'gRPC', 'WebSockets', 'Microservices',
  'System Design', 'OAuth', 'JWT', 'API Gateway',

  // AI & Data Science
  'Machine Learning', 'Deep Learning', 'Data Science', 'TensorFlow', 'PyTorch',
  'Scikit-learn', 'Pandas', 'NumPy', 'NLP', 'Computer Vision', 'LangChain',
  'OpenAI', 'LLM', 'Hugging Face',

  // Methodologies & Tools
  'Git', 'GitHub', 'GitLab', 'Agile', 'Scrum', 'Jira', 'Postman',
  'Unit Testing', 'Jest', 'Cypress', 'Playwright', 'TDD'
];

// Normalized lookup map for case-insensitive matching
const NORMALIZED_SKILLS = new Map();
SKILL_DICTIONARY.forEach((skill) => {
  NORMALIZED_SKILLS.set(skill.toLowerCase(), skill);
});

module.exports = {
  SKILL_DICTIONARY,
  NORMALIZED_SKILLS,
};
