# PlacementAI — AI-Powered Placement Preparation Suite

> Problem Statement: #26ENCL2 — CareerLaunch: AI-Powered Placement Preparation Suite

## 🚀 Live Demo
- **Frontend:** https://placementai.vercel.app
- **Backend:** https://placementai-backend.onrender.com

---

## 📌 What is PlacementAI?

PlacementAI is a comprehensive placement readiness platform that helps engineering students go from "I don't know where to start" to "I'm interview-ready" — with AI resume tools, mock interviews, aptitude training, GD simulation, and a company-specific preparation roadmap.

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 19, React Router, Vite            |
| Backend   | FastAPI (Python)                        |
| Database  | SQLite (via SQLAlchemy ORM)             |
| AI        | Groq API (llama-3.1-8b-instant)         |
| Auth      | JWT (python-jose) + SHA-256 hashing     |
| PDF       | jsPDF (frontend)                        |
| Payments  | Razorpay Sandbox                        |
| Deploy    | Vercel (frontend) + Render (backend)    |

---

## ✅ Features Built

### Resume Tools
- AI Resume Scorer — ATS score 0-100 with section feedback
- Keyword Gap Analysis — detect missing skills
- Resume vs Job Description Match — ATS match score
- AI Cover Letter Generator — tailored to JD
- Export Resume Analysis as PDF
- Export Cover Letter as PDF
- Multi-step Resume Builder (7 steps) with PDF download
- 3 Resume Templates (Classic, Modern, Minimal)

### AI Mock Interview
- 5-round adaptive interview (Intro → Technical → Projects → Problem Solving → HR)
- 3 interview types: Mixed, Technical, HR
- 4 company modes: General, Startup, MNC, FAANG
- Real-time AI evaluation with score, feedback, strengths
- Voice input (Web Speech API)
- Post-interview model answers per question
- Full session history with expandable answers

### AI Group Discussion Simulator
- 3 AI participants with different stances (Advocate, Devil's Advocate, Neutral)
- 10 curated topics + custom topic input
- Voice + text input
- AI evaluation: clarity, arguments, leadership, communication
- Score report with strengths and improvements

### Aptitude Training
- 3 topics: Quantitative, Logical Reasoning, Verbal Ability
- 10 questions per set, 15-minute timer
- Instant feedback with correct answers
- Session history and performance tracking

### Company Preparation Tracker
- 6 companies: TCS, Infosys, Wipro, Zoho, Amazon, Accenture
- Past interview questions per company
- Topics to cover + insider tips
- Preparation checklist with progress percentage
- Search and filter by company type

### Offer Comparison Tool
- Compare up to 4 job offers side by side
- AI scoring based on CTC, bond, work mode, perks
- Recommendation with reasoning
- Visual score bars + comparison table

### Dashboard
- Placement readiness score (0-100)
- Resume + interview history sparkline charts
- Weakness detection + smart suggestions
- Good morning/afternoon/evening greeting

### Other Features
- User authentication (register/login with JWT)
- Dark/Light theme toggle (persisted in localStorage)
- Collapsible sidebar navigation
- Mobile responsive with bottom nav bar
- In-app notification system
- Pricing page with Razorpay sandbox checkout

---

## 🏃 Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key (free at console.groq.com)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "GROQ_API_KEY=your_groq_key_here" > .env

# Run server
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://127.0.0.1:8000" > .env

# Run dev server
npm run dev
```

### Open in browser
http://localhost:5173

---

## 🔐 Test Account
Email:    test@placementai.com
Password: test123

---

## 💳 Sandbox Payment Test Card
Card Number: 4111 1111 1111 1111
Expiry:      Any future date (e.g. 12/26)
CVV:         Any 3 digits (e.g. 123)
OTP:         Enter any value

---

## 📁 Project Structure
interview/
├── backend/
│   ├── main.py              # FastAPI app + all routes
│   ├── auth.py              # JWT authentication
│   ├── database.py          # SQLAlchemy setup
│   ├── models/
│   │   └── models.py        # Database models
│   ├── routes/
│   │   └── auth_routes.py   # Auth endpoints
│   ├── services/
│   │   └── ai_service.py    # Groq AI functions
│   └── requirements.txt
└── frontend/
├── src/
│   ├── pages/           # All page components
│   ├── context/         # Theme + Notification context
│   ├── components/      # Reusable components
│   └── utils/           # Auth helpers + theme config
└── package.json

---

## 👥 Team Members

| Name | Role |
|------|------|
| Vinayakamoorthi | Full Stack Developer |

---

## ⚠️ Known Limitations

- Session history stores individual Q&A pairs, not full session groups
- Voice input requires Chrome browser (Web Speech API)
- Aptitude questions are static (not AI-generated)
- Company tracker has 6 companies (static data)
- GD simulator works best with Chrome for voice input
- Razorpay is in test/sandbox mode — no real payments

---

## 🔑 Environment Variables

### Backend `.env`
GROQ_API_KEY=your_groq_api_key

### Frontend `.env`
VITE_API_URL=https://your-backend.onrender.com

