# 📌 Resume Job Matcher

## 🔖 Project Title & Description
The **Resume Job Matcher** is a web application that allows job seekers to upload their resumes and automatically get matched with suitable job postings using AI (Gemini API). Recruiters can post jobs, and the system recommends candidates based on their skills and experience.

**Who it’s for:**
- **Job Seekers**: Easily find jobs that align with their skills.
- **Recruiters**: Quickly identify qualified candidates.

**Why it matters:**
Finding the right job or candidate is often time-consuming. This system streamlines the process using AI, making hiring and job seeking more efficient.

---

## 🛠️ Tech Stack

**Frontend**
- Next.js (React framework)
- Tailwind CSS (styling)
- ShadCN/UI (modern UI components)

**Backend**
- Node.js + Express (API layer)
- Supabase (PostgreSQL + Auth for structured data)
- MongoDB (unstructured data like resumes & AI matches)
- Gemini API (AI-powered resume-job matching)

**Other Tools**
- Docker (containerization)
- GitHub Actions (CI/CD)
- Vercel (Frontend hosting)
- Railway/Render (Backend + DB hosting)

---

## 📂 Project Folder Structure

```
resume-job-matcher/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Business logic for jobs, resumes, matches
│   │   ├── models/             # Database models (Supabase + MongoDB)
│   │   ├── routes/             # API routes
│   │   ├── services/           # External services (Gemini API, Auth, etc.)
│   │   └── utils/              # Helper functions
│   ├── tests/                  # Backend tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── app/                    # Next.js app router
│   ├── components/             # UI components
│   ├── pages/                  # Static pages
│   ├── styles/                 # Tailwind + global styles
│   └── package.json
│
├── database/
│   ├── supabase/               # SQL schema & migrations
│   └── mongodb/                # JSON schema definitions
│
├── docs/                       # Documentation (ERD, diagrams, notes)
│
├── .github/workflows/          # GitHub Actions CI/CD pipelines
├── docker-compose.yml          # Multi-service orchestration
├── README.md                   # Project documentation
└── LICENSE
```

---

## 🚀 Roadmap
- [ ] Set up Supabase for structured data (users, jobs, applications)
- [ ] Set up MongoDB for unstructured data (resumes, AI match results)
- [ ] Build backend APIs for auth, job posting, and resume upload
- [ ] Integrate Gemini API for resume-job matching
- [ ] Develop frontend with Next.js + Tailwind
- [ ] Implement real-time notifications for job matches
- [ ] Deploy on Vercel (frontend) & Railway/Render (backend)

