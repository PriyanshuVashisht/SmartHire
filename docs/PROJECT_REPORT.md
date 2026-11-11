# SmartHire: Intelligent Job & Internship Recommendation Platform
## Comprehensive Academic Project Report & Software Engineering Documentation
**Degree:** Bachelor of Technology (B.Tech) in Information Technology / Computer Science  
**Project Category:** Minor Project / Software Engineering Capstone  
**Implementation Architecture:** MERN Full-Stack (MongoDB, Express.js, React.js, Node.js)  

---

## 1. Abstract
Modern recruitment workflows suffer from a severe disconnect between job seekers and employers. Candidates submit hundreds of resumes without understanding how well their technical qualifications align with job descriptions, while recruiters are inundated with irrelevant applications that overwhelm manual review capacity.

**SmartHire** is an intelligent, full-stack recruitment platform designed to solve these systemic inefficiencies. Developed using the MERN technology stack, SmartHire implements an explainable, rule-based recommendation algorithm that quantitatively measures compatibility between candidate profiles and job postings across five weighted dimensions: Technical Skills (50%), Education Level (15%), Work Experience (15%), Job Preferences (10%), and Location Alignment (10%).

The platform features automated resume parsing (PDF/DOCX) using a controlled taxonomy of 200+ industry technologies, transparent skill-gap identification, interactive applicant ranking for hiring managers, deduplicated application tracking, and an administrative moderation portal. By emphasizing mathematical transparency over opaque black-box models, SmartHire provides explainable feedback to candidates and ranked talent shortlists to recruiters.

---

## 2. Problem Statement
Contemporary recruitment platforms (e.g., traditional job boards) present several major limitations:
1. **Opaque Matching Criteria:** Candidates receive rejections with zero actionable insight into why they were disqualified.
2. **Resume Overload for Recruiters:** Open job postings receive hundreds of unqualified applications, requiring hundreds of hours of manual filtering.
3. **Black-Box AI Skepticism:** Many modern AI recruitment tools rely on proprietary neural embeddings that cannot explain their internal scoring or are susceptible to hidden biases.
4. **Lack of Skill-Gap Guidance:** Job seekers cannot readily identify which specific skills are missing from their profile to qualify for target openings.
5. **Application Duplication:** Unregulated application spam degrades candidate database performance and recruiter trust.

---

## 3. Project Objectives
1. **Explainable Recommendation Engine:** Implement an algorithmic recommendation model providing a 0–100 weighted compatibility score accompanied by itemized matched skills, identified skill gaps, and natural language explanations.
2. **Automated Resume Parsing:** Parse PDF/DOCX resumes to extract technical skills against a controlled dictionary and auto-populate candidate profiles.
3. **Role-Based Workflows:** Deliver tailored interfaces and access privileges for three primary actors: **Job Seekers (Candidates)**, **Recruiters (Employers)**, and **System Administrators**.
4. **Recruitment Pipeline Management:** Enable recruiters to review ranked applicants, inspect verified resumes, update application stages (Applied, Under Review, Shortlisted, Interviewing, Hired, Rejected), and notify candidates in real time.
5. **Security & Data Integrity:** Implement bcrypt password encryption, JWT authentication, role-based authorization, rate limiting, and database constraints preventing duplicate submissions.

---

## 4. Scope of the System
### In Scope:
- User registration and JWT authentication with role enforcement.
- Candidate profile management with education, experience, skills, and projects.
- PDF and DOCX resume parsing with editable skill tag extraction.
- Searchable and filterable job directory (job type, experience, remote, salary).
- 5-factor weighted recommendation calculations for candidates and ranked applicant lists for recruiters.
- Application workflow with status history logging.
- System administrator dashboard with real-time platform statistics and account suspension capabilities.
- Zero-config in-memory MongoDB fallback for local evaluation and testing.

### Out of Scope (Future Enhancements):
- Direct video calling within the browser.
- External payment gateway for sponsored job advertisements.
- Multi-language localized UI translation.

---

## 5. Feasibility Study
### 5.1 Technical Feasibility
The platform is built on modern JavaScript/Node.js web technologies. Node.js provides non-blocking, event-driven asynchronous I/O, ideal for concurrent API requests. React 18 with Vite provides rapid component re-rendering and responsive interfaces. MongoDB's flexible schema handles varied candidate backgrounds, education arrays, and multi-faceted job requirements with high performance.

### 5.2 Economic Feasibility
The technology stack utilizes open-source software with zero licensing costs:
- **Frontend Hosting:** Vercel (Free Hobby Tier).
- **Backend API Hosting:** Render / Railway (Free / low-cost tier).
- **Database:** MongoDB Atlas (Free M0 Sandbox Tier) or embedded In-Memory database.
- Development tooling utilizes standard open-source npm packages.

### 5.3 Operational Feasibility
SmartHire requires no specialized hardware or proprietary desktop clients. Users access the platform via any modern web browser on desktop, tablet, or mobile. The user interface adheres to standard usability guidelines with clear affordances, loading skeletons, and interactive alerts.

---

## 6. Software Requirements Specification (SRS)
### 6.1 Functional Requirements
- **FR1: User Authentication & Role Management:** Secure registration and login using JWT tokens and bcrypt password hashing. Direct public registration as administrator is strictly forbidden.
- **FR2: Candidate Profile Management:** Candidates can record personal details, bio, headline, target job roles, preferred locations, salary expectations, education degrees, work experience, and projects.
- **FR3: Resume Ingestion & Parsing:** Upload PDF/DOCX resumes up to 10MB; extract contact info, education keywords, estimated years of experience, and matched technical skills against the controlled dictionary.
- **FR4: Job Posting Management:** Recruiters can create, edit, close, and list job and internship openings with required skills, weights, salary, and requirements.
- **FR5: Recommendation Calculation:** Compute compatibility scores (0–100) using the 5-factor weighted formula and provide skill coverage percentage.
- **FR6: Application Processing:** Candidates submit applications with optional cover notes. The system prevents duplicate submissions via compound database constraints.
- **FR7: Pipeline Progression:** Recruiters can update applicant status with feedback notes, triggering real-time notifications for candidates.
- **FR8: Administrative Oversight:** Admins can view platform metrics, search all users, suspend violating accounts, and moderate job postings.

### 6.2 Non-Functional Requirements
- **Performance:** Recommendation engine computes scores for 50 active listings in under 50 milliseconds.
- **Security:** Passwords salted and hashed with bcrypt (salt rounds = 10); API endpoints protected with JWT; HTTP headers secured via Helmet.
- **Reliability:** In-memory MongoDB fallback ensures the application runs seamlessly even if a local MongoDB service is uninstalled or unreachable.
- **Usability:** Responsive layout optimized for viewports from 360px (mobile) to 4K displays.

---

## 7. Intelligent Recommendation Engine Algorithm
SmartHire implements an **explainable, multi-factor rule-based algorithm** designed to provide 100% transparency.

### 7.1 Configurable Factor Weights
$$\text{Overall Score} = (S \times 0.50) + (E \times 0.15) + (X \times 0.15) + (P \times 0.10) + (L \times 0.10)$$

Where:
- $S$ = Technical Skills Score (50%)
- $E$ = Education Level Score (15%)
- $X$ = Work Experience Score (15%)
- $P$ = Job Preferences Score (10%)
- $L$ = Location Alignment Score (10%)

### 7.2 Component Calculations
1. **Skill Score ($S$) & Skill Coverage:**
   $$\text{Skill Coverage (\%)} = \left( \frac{\text{Number of Matched Required Skills}}{\text{Total Required Skills}} \right) \times 100$$
   $$\text{Weighted Skill Score } S = \min\left(100, \left( \frac{\sum \text{Weights of Matched Skills}}{\sum \text{Weights of All Required Skills}} \right) \times 100 \right)$$
   If a job specifies no required skills, $S = 100\%$.

2. **Education Score ($E$):**
   Degrees are mapped to an ordinal hierarchy:
   - Level 5: PhD / Doctorate
   - Level 4: Master's (M.Tech, MS, MCA)
   - Level 3: Bachelor's (B.Tech, B.E., BCA, BS)
   - Level 2: Diploma / Associate
   - Level 1: Secondary / High School
   
   If $\text{Candidate Level} \ge \text{Job Required Level}$, $E = 100\%$.  
   If $\text{Candidate Level} = \text{Job Required Level} - 1$, $E = 65\%$.  
   Otherwise, $E = 40\%$.

3. **Experience Score ($X$):**
   If Job Minimum Required Years $= 0$, $X = 100\%$.  
   If $\text{Candidate Years} \ge \text{Job Required Years}$, $X = 100\%$.  
   If $\text{Candidate Years} < \text{Job Required Years}$, $X = \max\left(25, \text{round}\left(\frac{\text{Candidate Years}}{\text{Job Required Years}} \times 100\right)\right)$.

4. **Job Preferences Score ($P$):**
   Evaluates alignment with preferred job types (full-time, internship) and title keywords. Full match yields 100%, partial yields 60%, unstated yields 70%.

5. **Location Score ($L$):**
   If the job is remote or candidate prefers remote, $L = 100\%$.  
   If candidate city matches job city, $L = 100\%$.  
   If within preferred locations array, $L = 95\%$.  
   Otherwise, $L = 45\%$.

---

## 8. Database Architecture & Schema Design
The system uses **MongoDB** with Mongoose ODM schemas:
1. **User:** Core authentication model with `name`, `email` (unique index), `password` (select: false), `role` (`candidate`, `recruiter`, `admin`), `isSuspended`.
2. **CandidateProfile:** Detailed candidate portfolio containing `user` reference, `headline`, `bio`, `jobPreferences`, `education` array, `experience` array, `skills` array, `projects` array, and `resume` reference.
3. **RecruiterProfile:** Organization link, `designation`, `department`, `phone`, `verified`.
4. **Company:** Organization entity with `name` (unique index), `industry`, `size`, `logo`, `location`, `recruiters` array.
5. **Job:** Postings with `title`, `company` ref, `recruiter` ref, `jobType`, `location`, `isRemote`, `salary`, `experienceLevel`, `requiredSkills` (name + weight), `status` (`active`, `closed`).
6. **Resume:** Ingested documents with `candidate` ref, `originalFilename`, `storedPath`, `fileType`, `extractedText`, `extractedSkills`, `parsedData`.
7. **Application:** Core transaction model linking `job` and `candidate`.
   - **Crucial Constraint:** Compound unique index `{ job: 1, candidate: 1 }` prevents duplicate submissions at the database level.
8. **Notification:** Activity alerts with `recipient`, `title`, `message`, `type`, `link`, `isRead`.
9. **Report:** Content moderation flags for jobs or user accounts.

---

## 9. API Specification Summary
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new candidate or recruiter account |
| `POST` | `/api/auth/login` | Public | Authenticate and issue JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile and role details |
| `GET` | `/api/jobs` | Public | Search and filter active job listings |
| `GET` | `/api/jobs/:id` | Public | Retrieve detailed job specifications and views |
| `POST` | `/api/jobs` | Recruiter | Post new job vacancy with skill weights |
| `PUT` | `/api/jobs/:id` | Recruiter | Update existing job posting |
| `DELETE` | `/api/jobs/:id` | Recruiter | Soft-close job posting |
| `GET` | `/api/recommendations/jobs` | Candidate | Retrieve ranked jobs with 5-factor match breakdown |
| `GET` | `/api/recommendations/jobs/:id/match` | Candidate | Compute match breakdown for single job |
| `POST` | `/api/resumes/upload` | Candidate | Upload and parse PDF/DOCX resume |
| `GET` | `/api/resumes/:id/download` | Authorized | Securely download authorized candidate resume |
| `POST` | `/api/applications` | Candidate | Submit job application with cover note |
| `GET` | `/api/applications/me` | Candidate | Retrieve candidate's applied jobs and status |
| `GET` | `/api/recruiter/applicants` | Recruiter | List applicants ranked by compatibility score |
| `PATCH` | `/api/applications/:id/status` | Recruiter | Update applicant status (shortlist, interview, etc.) |
| `GET` | `/api/admin/dashboard` | Admin | Retrieve platform demographic and pipeline metrics |
| `PATCH` | `/api/admin/users/:id/status` | Admin | Suspend or reactivate user account |

---

## 10. Security Architecture
1. **Password Hashing:** Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with a work factor of 10.
2. **Role Authorization Checks:** Backend middleware verifies the JWT signature and checks `req.user.role` against required roles on every protected endpoint. Roles sent in request bodies are ignored.
3. **Resume Access Authorization:** Download routes enforce strict permissions: only the candidate, the recruiter who posted the job applied to, or an administrator can download a candidate's resume.
4. **Rate Limiting:** Protects `/api/auth` endpoints from brute-force credential stuffing (30 requests/15 mins per IP).
5. **Secure HTTP Headers:** Configured via `helmet` to mitigate Cross-Site Scripting (XSS) and clickjacking.

---

## 11. Testing & Validation Report
Automated test suite (`server/tests/verifyAll.js`) executes integration and unit checks:
- **Test 1: JWT Generation & Verification:** PASS (Validates token structure and signature decoding).
- **Test 2: Password Hashing:** PASS (Verifies bcrypt salting and comparison).
- **Test 3: Recommendation Engine:** PASS (Asserts accurate 5-factor weighted calculation, matched skills, and 75% skill coverage on sample inputs).
- **Test 4: Duplicate Application Prevention:** PASS (Asserts MongoDB error code 11000 duplicate rejection).
- **Test 5: Role Authorization Constraints:** PASS (Verifies privilege boundaries).
- **Test 6: Database Relationships:** PASS (Verifies population across Users, Jobs, and Applications).

---

## 12. Deployment Guide
- **Frontend (Vercel):** Connect GitHub repository, set Root Directory to `client`, set Build Command to `npm run build`, and Output Directory to `dist`. Set Environment Variable `VITE_API_BASE_URL` pointing to the deployed backend.
- **Backend (Render / Railway):** Set Root Directory to `server`, Build Command to `npm install`, and Start Command to `npm start`. Configure Environment Variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`).
- **Database (MongoDB Atlas):** Create free M0 cluster, configure Network Access (`0.0.0.0/0`), create Database User, and set connection string as `MONGO_URI`.

---

## 13. Limitations & Future Scope
- **Current Limitations:** Resume parsing uses rule-based regex and keyword dictionaries; highly stylized multi-column PDF layouts may occasionally drop isolated keywords.
- **Future Enhancements:**
  1. Add TF-IDF and cosine semantic vector similarity for natural language job description matching.
  2. Implement WebRTC video interview scheduling directly within the recruiter dashboard.
  3. Introduce automated email and SMS notification integrations via SendGrid/Twilio.
