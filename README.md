# AI-Powered Job Board

**University Capstone Project by Naga Manohar Sharma Sankaramanchi**

A full-stack AI-powered job board web application that uses TF-IDF cosine similarity to match job seekers with relevant job postings, provides skill gap analysis, and generates AI-powered cover letters.

## Tech Stack

- **Frontend:** React.js (Vite) + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcrypt
- **AI Matching:** TF-IDF Cosine Similarity (Node.js)
- **Cover Letters:** OpenAI API (with template fallback)

## Features

1. **Landing Page** - Hero section with feature highlights and platform stats
2. **User Authentication** - Registration and login for job seekers and employers
3. **Job Seeker Profile** - Skills management, experience, bio, and location
4. **Job Search** - Full-text search with filters (location, job type, salary range)
5. **AI Match Scoring** - TF-IDF cosine similarity between user skills and job requirements
6. **Job Detail Page** - Match percentage display with skill gap analysis
7. **Cover Letter Generator** - AI-generated (OpenAI) or template-based cover letters
8. **Skill Gap Analysis** - Visual display of matched skills (green) and missing skills (red)
9. **Employer Dashboard** - Post jobs, view candidates ranked by match score, accept/reject
10. **Application Tracking** - Track application status (pending, reviewed, accepted, rejected)
11. **Analytics Dashboard** - Stats overview for both job seekers and employers

## Project Structure

```
ai-job-board/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable components (Navbar, MatchScore, SkillTag, etc.)
│   │   ├── context/         # Auth context provider
│   │   ├── pages/           # Page components (Landing, JobSearch, JobDetail, etc.)
│   │   └── utils/           # API utility (Axios instance)
│   └── vite.config.js
├── server/                  # Express backend
│   ├── models/              # Mongoose schemas (User, Job)
│   ├── middleware/          # JWT auth middleware
│   ├── routes/              # API routes (auth, users, jobs, applications, analytics)
│   ├── utils/               # TF-IDF matching algorithm
│   ├── seed.js              # Database seed script (25 sample jobs)
│   └── server.js            # Express app entry point
└── README.md
```

## Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm

## Setup Instructions

### 1. Clone and install dependencies

```bash
cd ai-job-board

# Install server dependencies
cd server
cp .env.example .env
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment variables

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/ai-job-board
JWT_SECRET=your-secret-key-change-in-production
OPENAI_API_KEY=optional-for-ai-cover-letters
PORT=5000
```

> **Note:** The `OPENAI_API_KEY` is optional. Without it, cover letters are generated using a professional template.

### 3. Seed the database

```bash
cd server
npm run seed
```

This creates:
- 2 employer accounts
- 3 job seeker accounts (with different skill profiles)
- 25 sample job postings
- Sample applications

### 4. Start the application

In two terminal windows:

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on port 5000.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Employer | sarah@techcorp.com | password123 |
| Employer | james@innovatelabs.com | password123 |
| Job Seeker | manohar@email.com | password123 |
| Job Seeker | priya@email.com | password123 |
| Job Seeker | alex@email.com | password123 |

Each job seeker has a different skill profile:
- **Manohar** - Full Stack (JavaScript, React, Node.js, Python, MongoDB)
- **Priya** - Data Science (Python, TensorFlow, ML, NLP, Pandas)
- **Alex** - DevOps (AWS, Docker, Kubernetes, Terraform, Go)

## How AI Matching Works

The matching algorithm uses **TF-IDF (Term Frequency-Inverse Document Frequency)** with **cosine similarity**:

1. User skills and job required skills are normalized
2. A vocabulary is built from both skill sets
3. TF-IDF vectors are computed for each set
4. Cosine similarity measures the angle between vectors
5. The score is blended: 60% cosine similarity + 40% direct skill overlap
6. Result: 0-100% match score with matched/missing skills breakdown

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/users/me | Get current user |
| PUT | /api/users/me | Update profile |
| GET | /api/jobs | List jobs (with filters) |
| GET | /api/jobs/:id | Get job detail |
| POST | /api/jobs | Create job (employer) |
| POST | /api/jobs/:id/apply | Apply to job |
| POST | /api/jobs/:id/cover-letter | Generate cover letter |
| GET | /api/jobs/:id/candidates | View candidates (employer) |
| GET | /api/applications | Get user applications |
| GET | /api/analytics | Get analytics data |

---

*Built by Naga Manohar Sharma Sankaramanchi*
