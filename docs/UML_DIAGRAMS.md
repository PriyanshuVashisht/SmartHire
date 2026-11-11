# SmartHire — Complete UML & System Architecture Diagrams

This document contains editable **Mermaid** diagrams accurately reflecting the implemented SmartHire platform.

---

## 1. System Architecture Diagram

```mermaid
graph TD
    subgraph Client_Tier["Client Tier (Frontend - React + Vite + Tailwind)"]
        UI["Web UI Components & Pages"]
        Router["React Router v6"]
        AxiosClient["Axios HTTP Interceptor (JWT)"]
        State["Auth & Notification Contexts"]
        UI --> Router
        Router --> State
        State --> AxiosClient
    end

    subgraph API_Tier["Application Tier (Node.js + Express REST API)"]
        Server["Express Server (Port 5000)"]
        SecMW["Security MW (Helmet, CORS, RateLimit)"]
        AuthMW["Auth MW (JWT & Role Guards)"]
        
        subgraph Controllers["Modular Controllers"]
            AuthC["Auth Controller"]
            JobC["Job Controller"]
            CandC["Candidate Controller"]
            RecC["Recruiter Controller"]
            RecEngC["Recommendation Controller"]
            ResC["Resume Controller"]
            AppC["Application Controller"]
            AdminC["Admin Controller"]
        end

        subgraph Services["Core Engine Services"]
            RecEngine["5-Factor Recommendation Engine<br/>(Skills 50%, Edu 15%, Exp 15%, Pref 10%, Loc 10%)"]
            Parser["Resume Parser Service (PDF/DOCX)"]
            Taxonomy["Controlled Skill Dictionary (200+ Skills)"]
        end

        Server --> SecMW --> AuthMW
        AuthMW --> Controllers
        RecEngC --> RecEngine
        ResC --> Parser
        Parser --> Taxonomy
    end

    subgraph Data_Tier["Data Tier (MongoDB)"]
        Mongo["MongoDB / MongoMemoryServer"]
        Collections[("Collections: Users, Profiles, Companies, Jobs, Resumes, Applications, Notifications, Reports")]
        Mongo --> Collections
    end

    AxiosClient -- "JSON / HTTPS" --> Server
    Controllers -- "Mongoose ODM" --> Mongo
```

---

## 2. Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        Candidate["Job Seeker / Candidate"]
        Recruiter["Recruiter / Employer"]
        Admin["System Administrator"]
    end

    subgraph SmartHire_Platform["SmartHire System"]
        UC1["Register & Authenticate"]
        UC2["Maintain Candidate Profile"]
        UC3["Upload & Parse Resume"]
        UC4["Search & Filter Jobs"]
        UC5["View Explainable Match Scores & Skill Gaps"]
        UC6["Apply for Job Openings"]
        UC7["Track Application Timeline"]
        
        UC8["Manage Organization Profile"]
        UC9["Post & Manage Job Listings"]
        UC10["View Algorithmic Candidate Rankings"]
        UC11["Review Applicant Resumes"]
        UC12["Update Application Pipeline Status"]
        UC13["View Recruiter Pipeline Metrics"]

        UC14["Monitor Platform Demographics"]
        UC15["Suspend / Activate Accounts"]
        UC16["Moderate Job Listings"]
        UC17["Resolve Content Reports"]
    end

    Candidate --> UC1
    Candidate --> UC2
    Candidate --> UC3
    Candidate --> UC4
    Candidate --> UC5
    Candidate --> UC6
    Candidate --> UC7

    Recruiter --> UC1
    Recruiter --> UC8
    Recruiter --> UC9
    Recruiter --> UC10
    Recruiter --> UC11
    Recruiter --> UC12
    Recruiter --> UC13

    Admin --> UC1
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
```

---

## 3. Class Diagram

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String role
        +Boolean isSuspended
        +Date createdAt
        +comparePassword(candidatePassword) Boolean
    }

    class CandidateProfile {
        +ObjectId user
        +String headline
        +String bio
        +String phone
        +String location
        +Number totalExperienceYears
        +Object jobPreferences
        +Array education
        +Array experience
        +Array skills
        +Array projects
        +ObjectId resume
        +calculateExperienceYears() Number
    }

    class RecruiterProfile {
        +ObjectId user
        +ObjectId company
        +String designation
        +String department
        +String phone
        +Boolean verified
    }

    class Company {
        +String name
        +String website
        +String industry
        +String size
        +String logo
        +String description
        +String location
        +String headquarters
        +Number foundedYear
        +Array recruiters
    }

    class Job {
        +String title
        +ObjectId company
        +ObjectId recruiter
        +String department
        +String description
        +String jobType
        +String location
        +Boolean isRemote
        +Object salary
        +String experienceLevel
        +Array requiredSkills
        +String minEducation
        +Number minExperienceYears
        +String status
        +Number viewsCount
        +Number applicantsCount
    }

    class Resume {
        +ObjectId candidate
        +String originalFilename
        +String storedPath
        +String fileType
        +Number fileSize
        +String extractedText
        +Array extractedSkills
        +Object parsedData
        +Date uploadedAt
    }

    class Application {
        +ObjectId job
        +ObjectId candidate
        +ObjectId resume
        +String coverNote
        +String status
        +Object matchScore
        +String recruiterNotes
        +Array statusHistory
        +Date appliedAt
    }

    class Notification {
        +ObjectId recipient
        +ObjectId sender
        +String title
        +String message
        +String type
        +String link
        +Boolean isRead
        +Date createdAt
    }

    User "1" <-- "1" CandidateProfile : references
    User "1" <-- "1" RecruiterProfile : references
    Company "1" <-- "*" RecruiterProfile : employs
    RecruiterProfile "1" <-- "*" Job : posts
    Job "*" --> "1" Company : belongsTo
    User "1" <-- "*" Resume : uploads
    CandidateProfile "1" --> "0..1" Resume : links
    Job "1" <-- "*" Application : receives
    User "1" <-- "*" Application : submits
    Resume "0..1" <-- "*" Application : includes
    User "1" <-- "*" Notification : notifies
```

---

## 4. Activity Diagram: Candidate Job Application Workflow

```mermaid
flowchart TD
    Start([Candidate Starts]) --> RegLog[Register / Log In to SmartHire]
    RegLog --> ProfileCheck{Profile Completed?}
    ProfileCheck -- No --> FillProf[Complete Profile & Upload Resume]
    FillProf --> ParseRes[System Extracts Skills via Controlled Taxonomy]
    ParseRes --> ReviewSkills[Candidate Reviews & Edits Extracted Skills]
    ReviewSkills --> BrowseJobs
    ProfileCheck -- Yes --> BrowseJobs[Browse Jobs or Open Recommendations]

    BrowseJobs --> RunEngine[Engine Evaluates 5-Factor Weighted Score]
    RunEngine --> ViewScores[Candidate Inspects Overall Score, Matched & Missing Skills]
    ViewScores --> Decide{Apply for Position?}
    Decide -- No --> BrowseJobs
    Decide -- Yes --> CheckDupe{Already Applied to this Job?}

    CheckDupe -- Yes --> RejectDupe[Show Existing Status Timeline]
    CheckDupe -- No --> CheckStatus{Is Job Active?}

    CheckStatus -- No --> RejectClosed[Show Job Closed Warning]
    CheckStatus -- Yes --> InputNote[Enter Optional Cover Note]

    InputNote --> SubmitApp[Submit Application]
    SubmitApp --> SaveApp[Save Application with Match Breakdown & History]
    SaveApp --> NotifyRec[Dispatch Real-Time Notification to Recruiter]
    NotifyRec --> RecReview[Recruiter Reviews Ranked Applicant]

    RecReview --> Decision{Recruiter Action}
    Decision -- Shortlist --> StShort[Set Status: Shortlisted]
    Decision -- Interview --> StInt[Set Status: Interviewing]
    Decision -- Reject --> StRej[Set Status: Rejected]
    Decision -- Hire --> StHire[Set Status: Hired]

    StShort --> NotifyCand[Notify Candidate of Pipeline Update]
    StInt --> NotifyCand
    StRej --> NotifyCand
    StHire --> NotifyCand

    NotifyCand --> End([Application Workflow Completed])
```

---

## 5. Sequence Diagram: Algorithmic Recommendation & Application

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant UI as React Frontend
    participant Server as Express Server
    participant Engine as RecommendationEngine
    participant DB as MongoDB Database
    actor Recruiter

    Candidate->>UI: Navigates to AI Match View
    UI->>Server: GET /api/recommendations/jobs (Bearer JWT)
    Server->>DB: Query CandidateProfile & Active Jobs
    DB-->>Server: Return Profile & Jobs Data
    Server->>Engine: rankJobsForCandidate(candidateProfile, jobs)
    Note over Engine: Computes 5-Factor Score<br/>Skills(50%) + Edu(15%) + Exp(15%) + Pref(10%) + Loc(10%)
    Engine-->>Server: Returns Ranked Jobs with Match Breakdown & Explanations
    Server-->>UI: 200 OK (JSON Recommendations)
    UI-->>Candidate: Renders Ranked Jobs with Matched & Missing Skills

    Candidate->>UI: Clicks Apply on Job & Enters Cover Note
    UI->>Server: POST /api/applications { jobId, coverNote }
    Server->>DB: Check Duplicate (jobId + candidateId)
    DB-->>Server: Not found (Unique)
    Server->>Engine: calculateCandidateJobMatch(profile, job)
    Engine-->>Server: Match Score Object
    Server->>DB: Insert Application Document & Increment Job Applicants Count
    Server->>DB: Create Notification for Recruiter
    DB-->>Server: Saved Successfully
    Server-->>UI: 201 Created (Application Details)
    UI-->>Candidate: Displays Success & Status Timeline

    Recruiter->>UI: Opens Recruiter Applicants Portal
    UI->>Server: GET /api/recruiter/applicants?sortBy=score_desc
    Server->>DB: Query Applications (Populate Candidate & Job)
    DB-->>Server: Return Ranked Applicants
    Server-->>UI: 200 OK
    UI-->>Recruiter: Displays Candidates Sorted by Match Score %
```

---

## 6. State Chart Diagram: Application Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Applied: Candidate Submits Application
    
    Applied --> UnderReview: Recruiter Opens Candidate Profile
    UnderReview --> Shortlisted: Candidate Meets Skill Criteria
    UnderReview --> Rejected: Candidate Does Not Meet Qualifications

    Shortlisted --> Interviewing: Technical / Behavioral Round Scheduled
    Shortlisted --> Rejected: Position Filled or Mismatch

    Interviewing --> Hired: Offer Accepted
    Interviewing --> Rejected: Interview Performance Below Bar

    Hired --> [*]
    Rejected --> [*]
```

---

## 7. Communication Diagram: Recruiter Updating Applicant Status

```mermaid
graph LR
    Recruiter((Recruiter)) -- "1: Selects Status & Enters Note" --> UI[React UI]
    UI -- "2: PATCH /api/applications/:id/status" --> Auth[Auth Middleware]
    Auth -- "3: Verify JWT & Recruiter Role" --> AppController[Application Controller]
    AppController -- "4: Verify Job Ownership" --> DBJob[(Job Model)]
    AppController -- "5: Update Status & StatusHistory" --> DBApp[(Application Model)]
    AppController -- "6: Create Notification" --> DBNotif[(Notification Model)]
    AppController -- "7: 200 OK Response" --> UI
    UI -- "8: Refresh Pipeline View" --> Recruiter
    DBNotif -. "9: Push Alert" .-> Candidate((Candidate))
```

---

## 8. Component Diagram

```mermaid
graph TD
    subgraph Client_Components["Client Components (React 18)"]
        NavComp["Navbar & Navigation"]
        AuthCtx["Auth Context Provider"]
        NotifCtx["Notification Context Provider"]
        JobPages["Job & Recommendation Views"]
        RecPages["Recruiter Management Views"]
        AdminPages["Admin Governance Views"]
        Axios["Axios API Client"]

        NavComp --> AuthCtx
        JobPages --> Axios
        RecPages --> Axios
        AdminPages --> Axios
        NotifCtx --> Axios
    end

    subgraph Server_Modules["Server Modules (Node.js/Express)"]
        Routes["Express Router (10 Route Handlers)"]
        Middlewares["Middlewares (Auth, Upload, RateLimit, ErrorHandler)"]
        Controllers["Controllers (REST Logic)"]
        RecEngine["Recommendation Engine Service"]
        Parser["Resume Parser Service"]

        Routes --> Middlewares
        Middlewares --> Controllers
        Controllers --> RecEngine
        Controllers --> Parser
    end

    subgraph Data_Layer["Database Layer"]
        Mongoose["Mongoose ODM Models"]
        MongoDB[("MongoDB Database")]

        Controllers --> Mongoose
        Mongoose --> MongoDB
    end

    Axios -- "HTTP REST / JSON" --> Routes
```

---

## 9. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o| CANDIDATE_PROFILE : "has profile"
    USER ||--o| RECRUITER_PROFILE : "has profile"
    USER ||--o{ RESUME : "uploads"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ REPORT : "files / targeted"
    
    COMPANY ||--o{ RECRUITER_PROFILE : "employs"
    COMPANY ||--o{ JOB : "hosts"
    
    RECRUITER_PROFILE ||--o{ JOB : "posts"
    
    JOB ||--o{ APPLICATION : "receives"
    USER ||--o{ APPLICATION : "submits"
    RESUME ||--o{ APPLICATION : "attached to"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "candidate|recruiter|admin"
        boolean isSuspended
        datetime createdAt
    }

    CANDIDATE_PROFILE {
        ObjectId _id PK
        ObjectId user FK,UK
        string headline
        string bio
        string location
        number totalExperienceYears
        json jobPreferences
        array education
        array experience
        array skills
        array projects
        ObjectId resume FK
    }

    RECRUITER_PROFILE {
        ObjectId _id PK
        ObjectId user FK,UK
        ObjectId company FK
        string designation
        string department
        string phone
        boolean verified
    }

    COMPANY {
        ObjectId _id PK
        string name UK
        string website
        string industry
        string size
        string location
        number foundedYear
        boolean verified
    }

    JOB {
        ObjectId _id PK
        string title
        ObjectId company FK
        ObjectId recruiter FK
        string department
        string jobType
        string location
        boolean isRemote
        json salary
        string experienceLevel
        array requiredSkills
        string minEducation
        number minExperienceYears
        string status "active|closed|draft"
        number applicantsCount
    }

    APPLICATION {
        ObjectId _id PK
        ObjectId job FK
        ObjectId candidate FK
        ObjectId resume FK
        string coverNote
        string status "applied|under_review|shortlisted|interviewing|rejected|hired"
        json matchScore
        string recruiterNotes
        array statusHistory
        datetime appliedAt
    }

    RESUME {
        ObjectId _id PK
        ObjectId candidate FK
        string originalFilename
        string storedPath
        string fileType
        number fileSize
        string extractedText
        array extractedSkills
        json parsedData
        datetime uploadedAt
    }
```
