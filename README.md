# SmartHire — Intelligent Job & Internship Recommendation Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests Passing](https://img.shields.io/badge/Tests-6%2F6%20Passing-emerald.svg)]()

> **B.Tech IT Minor Project & Engineering Portfolio**  
> A recruitment platform connecting job seekers and hiring managers through personalized recommendations, automated resume parsing, transparent skill-gap identification, and pipeline tracking.

---

## 🌟 Key Highlights & Differentiating Features

- **Explainable 5-Factor Recommendation Engine:** Calculates an overall 0–100 compatibility score using weighted parameters:
  - **Technical Skills:** 50%
  - **Education Level:** 15%
  - **Work Experience:** 15%
  - **Job Preferences:** 10%
  - **Location Alignment:** 10%
- **Itemized Skill-Gap Analysis:** Dissects job requirements into **Matched Skills** vs. **Identified Skill Gaps**, with skill coverage percentage.
- **Automated Resume Parsing (PDF/DOCX):** Extracts contact details, education keywords, estimated years of experience, and technical skills mapped to a 200+ skill taxonomy.
- **Three Distinct User Personas:**
  - **Job Seeker (Candidate):** Build profiles, parse resumes, explore recommendations, 1-click apply, track application status.
  - **Recruiter (Employer):** Post jobs with skill weights, rank candidates by match %, inspect resumes, update application pipeline.
  - **System Administrator:** Platform metrics, demographic distribution, user suspension, and job moderation.
- **Zero-Config Database Fallback:** Automatic connection to local/Atlas MongoDB with an embedded `mongodb-memory-server` fallback for instant offline demonstrations.
- **Production-Ready Security:** JWT authentication, bcrypt password salting, role-based authorization, rate limiting, and database constraints preventing duplicate applications.

---

## 🏗️ System Architecture

```
                                  SMARTHIRE PLATFORM ARCHITECTURE
                                  
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                      Client Tier (React 18 + Vite + Tailwind)               │
  │  LandingPage │ JobsPage │ JobDetail │ Recommendations │ Resume │ Dashboards │
  └──────────────────────────────────────┬──────────────────────────────────────┘
                                         │ HTTPS / REST (Axios + JWT)
  ┌──────────────────────────────────────▼──────────────────────────────────────┐
  │                   Application Tier (Node.js + Express.js API)               │
  │  Security MW (Helmet, RateLimit) │ Auth MW (JWT, Roles) │ Upload MW (Multer)│
  │  Controllers: Auth, Jobs, Candidates, Recruiters, Applications, Admin       │
  │  Services: 5-Factor Recommendation Engine │ 200+ Skill Taxonomy Parser      │
  └──────────────────────────────────────┬──────────────────────────────────────┘
                                         │ Mongoose ODM
  ┌──────────────────────────────────────▼──────────────────────────────────────┐
  │                       Data Tier (MongoDB / Atlas / In-Memory)               │
  │  Users │ CandidateProfiles │ RecruiterProfiles │ Companies │ Jobs │ Resumes │
  │  Applications (Unique compound index) │ Notifications │ Reports             │
  └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js:** v18.x or v20.x installed ([Download Node.js](https://nodejs.org/))
- **npm:** v9.x or v10.x (comes with Node.js)
- **MongoDB:** (Optional) Local MongoDB or MongoDB Atlas URI. *If unavailable, the system automatically uses an in-memory database!*

### 2. Installation
From the root project directory:
```bash
# Install root orchestration dependencies
npm install

# Install server backend dependencies
cd server && npm install

# Install client frontend dependencies
cd ../client && npm install
```

### 3. Seed Realistic Demo Data
Populate the database with pre-configured companies (Google, Stripe, NextGen AI), recruiters, candidates with varied skill profiles, and jobs:
```bash
cd server
npm run seed
```

### 4. Run the Development Server
From the root directory, launch both the frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend Application:** Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Backend REST API:** Running on [http://localhost:5000](http://localhost:5000) (Health check: `/api/health`).

---

## 🔑 Demo Accounts for Immediate Testing & Presentation

Use the **1-Click Demo Buttons** on the login page or enter these pre-seeded credentials:

| Role | Email | Password | Name & Description |
| :--- | :--- | :--- | :--- |
| **Candidate (MERN)** | `candidate@smarthire.dev` | `Password123!` | Rahul Sharma (NIT B.Tech IT, 2 yrs exp, React/Node/Mongo) |
| **Candidate (Frontend)** | `priya@smarthire.dev` | `Password123!` | Priya Patel (B.E. Computer, 1.5 yrs exp, React/Tailwind/Next) |
| **Recruiter (Google)** | `recruiter@smarthire.dev` | `Password123!` | Sarah Jenkins (Google India Talent Partner) |
| **Recruiter (Stripe)** | `recruiter2@smarthire.dev` | `Password123!` | David Chen (Stripe Lead Engineering Recruiter) |
| **Administrator** | `admin@smarthire.dev` | `Password123!` | System Administrator (Full platform governance) |

---

## 🧪 Verification & Automated Testing

Execute the comprehensive integration test suite verifying authentication, database models, recommendation math, and duplicate application prevention:

```bash
cd server
node tests/verifyAll.js
```

**Test Results:**
```
==================================================
STARTING SMARTHIRE BACKEND INTEGRATION & LOGIC TESTS
==================================================
  ✓ PASS: JWT Token Generation & Verification
  ✓ PASS: User Models & Password Hashing
  ✓ PASS: Recommendation Engine 5-Factor Match Calculation
  ✓ PASS: Database Prevention of Duplicate Applications
  ✓ PASS: Role-Based Authorization Constraints
  ✓ PASS: Data Population & Entity Relationships
==================================================
TEST RESULTS: 6 PASSED, 0 FAILED
==================================================
```

To verify the client production build:
```bash
cd client
npm run build
```
*(✓ 2,220 modules transformed and bundled into `client/dist/` in 6.11s with 0 errors).*

---

## 📁 Project Folder Structure

```
minor/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/                # Axios client with JWT interceptors
│   │   ├── components/         # Navbar, Footer, Badge, MatchScoreBadge, StatCard, Modal
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── pages/              # 12+ Pages (Landing, Login, Register, Jobs, JobDetail,
│   │   │                       # Recommendations, Resume, Applications, RecruiterDashboard,
│   │   │                       # RecruiterJobs, CreateJob, ApplicantRanking, Company, Admin)
│   │   ├── App.jsx             # React Router v6 route configuration
│   │   ├── index.css           # Tailwind base styles and custom animations
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML5 entry with Inter font
│   ├── package.json            # Client dependencies (React, Recharts, Lucide, Tailwind)
│   ├── tailwind.config.js      # Custom theme & color palette
│   └── vite.config.js          # Vite config with backend /api proxy
├── server/                     # Backend (Node.js + Express.js REST API)
│   ├── config/
│   │   └── db.js               # MongoDB connection with in-memory zero-config fallback
│   ├── controllers/            # 10 Controllers (Auth, Jobs, Candidates, Recruiters,
│   │                           # Recommendations, Resumes, Applications, Notifications, Admin)
│   ├── middleware/             # Auth (JWT & roles), ErrorHandler, Multer Upload, RateLimiter
│   ├── models/                 # 9 Mongoose Models (User, CandidateProfile, RecruiterProfile,
│   │                           # Company, Job, Resume, Application, Notification, Report)
│   ├── routes/                 # 10 Express API route handlers
│   ├── seeds/
│   │   └── seeder.js           # Realistic development demo database seeder
│   ├── services/
│   │   ├── recommendationEngine.js  # 5-factor weighted matching algorithm
│   │   ├── resumeParser.js          # PDF/DOCX text & skill extraction
│   │   └── skillDictionary.js       # 200+ controlled technical skills taxonomy
│   ├── tests/
│   │   └── verifyAll.js        # Automated integration test suite
│   ├── uploads/resumes/        # Secure resume storage
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Server dependencies (Express, Mongoose, bcryptjs, JWT)
│   └── server.js               # Express application entry & middleware pipeline
├── docs/                       # Complete Academic Documentation & UML
│   ├── BUILD_STATUS.md         # Implementation status & run instructions
│   ├── PROJECT_REPORT.md       # Full academic project report (SRS, Feasibility, Specs)
│   ├── UML_DIAGRAMS.md         # 7 UML Diagrams + ER + System Architecture (Mermaid)
│   ├── PRESENTATION_SLIDES.md  # 15-Slide technical presentation with speaker notes
│   └── VIVA_QUESTIONS_30.md    # 35 viva questions with confident technical answers
├── .gitignore                  # Git exclusions (node_modules, .env, private resumes)
└── package.json                # Root orchestration scripts (concurrent dev runner)
```

---

## 📚 Academic Documentation & Diagrams

Complete documentation is available inside the [`docs/`](file:///C:/Users/priya/OneDrive/Desktop/minor/docs) directory:
- [**PROJECT_REPORT.md**](file:///C:/Users/priya/OneDrive/Desktop/minor/docs/PROJECT_REPORT.md): Abstract, Problem Statement, Objectives, Scope, Feasibility Study, SRS (Functional & Non-Functional), Architecture, Database Design, API Documentation, Algorithm Formulation, Security, and Testing.
- [**UML_DIAGRAMS.md**](file:///C:/Users/priya/OneDrive/Desktop/minor/docs/UML_DIAGRAMS.md): 7 UML Diagrams (Use Case, Class, Activity, Sequence, State Chart, Communication, Component) + Entity-Relationship (ER) + System Architecture diagram in editable Mermaid.
- [**PRESENTATION_SLIDES.md**](file:///C:/Users/priya/OneDrive/Desktop/minor/docs/PRESENTATION_SLIDES.md): 15-Slide presentation outline with detailed speaker notes.
- [**VIVA_QUESTIONS_30.md**](file:///C:/Users/priya/OneDrive/Desktop/minor/docs/VIVA_QUESTIONS_30.md): 35 Viva Voce examination questions with clear technical answers.

---

## 🌐 Connecting to GitHub

To upload this completed project to your GitHub account:
1. Open terminal in the project directory:
   ```bash
   cd C:\Users\priya\OneDrive\Desktop\minor
   ```
2. Initialize Git and create the initial commit:
   ```bash
   git init
   git add .
   git commit -m "feat: complete SmartHire full-stack MERN recommendation platform"
   ```
3. Create a new repository named `SmartHire` on [GitHub](https://github.com/new).
4. Link and push to your GitHub repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/SmartHire.git
   git push -u origin main
   ```

---

## 🚢 Deployment Guide

### Frontend Deployment (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Build Command: `npm run build`. Output Directory: `dist`.
4. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com`

### Backend Deployment (Render / Railway)
1. Create new Web Service on [Render](https://render.com).
2. Set Root Directory to `server`.
3. Build Command: `npm install`. Start Command: `npm start`.
4. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/smarthire`
   - `JWT_SECRET`: `<your-random-64-character-secret>`
   - `CLIENT_URL`: `https://your-smarthire-frontend.vercel.app`

---

## 📄 License
This project is licensed under the MIT License — feel free to use it for academic and educational purposes.
