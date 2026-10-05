# 🎓 AI Powered Literacy Assistant for Neo Learners

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-brightgreen?style=for-the-badge&logo=vercel)](https://ai-powered-literacy-assistant-for-n.vercel.app/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react)](https://ai-powered-literacy-assistant-for-n.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688?style=for-the-badge&logo=fastapi)](https://render.com)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

An intelligent, interactive, multilingual literacy platform designed specifically for adult **neo-learners** to diagnose reading, writing, and speech proficiency, receive AI-powered feedback, and follow dynamically generated personalized learning paths.

🔗 **Live Application URL**: [https://ai-powered-literacy-assistant-for-n.vercel.app/](https://ai-powered-literacy-assistant-for-n.vercel.app/)

---

## 🌟 Key Features

- **🌐 Multilingual & Regional Support**: Full UI and content localization in **English**, **Hindi (हिन्दी)**, and **Marathi (मराठी)** with dynamic language switching.
- **🎙️ AI Voice Pronunciation & Speaking Practice**:
  - Word-by-word accuracy, fluency, and completeness scoring.
  - Phoneme-level breakdowns and phonetic pronunciation guides.
  - Multi-difficulty speech drills and tongue twisters.
- **📝 Diagnostic 3-in-1 Literacy Assessment**:
  - **Reading**: Comprehension and contextual reading tests.
  - **Writing**: Free-text prompts evaluated by Gemini AI for grammar, coherence, and vocabulary.
  - **Speaking**: Real-time microphone audio evaluation with instant transcription and acoustic analysis.
- **🤖 Dynamic AI Curriculum & Lesson Generator**:
  - Personalized mini-lessons and adaptive quizzes tailored to individual proficiency levels.
  - Custom topic generation powered by Google Gemini.
- **🏆 Gamification & Motivation Engine**:
  - Daily learning streaks, XP point progression, and level badges (Seed 🌱 → Tree 🌳 → Crown 👑).
  - Daily interactive quests and live leaderboard standings.
- **📊 Detailed Analytics & Progress Reports**:
  - Comprehensive skill radar and historical competency trajectories.
  - Targeted recommendations and downloadable performance insights.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph LR
    User[Learner] -->|Web Browser| Frontend[React + TypeScript SPA on Vercel]
    Frontend -->|REST API Requests| Backend[FastAPI Server on Render]
    Backend -->|LLM & Audio Analysis| Gemini[Google Gemini AI]
    Backend -->|ORM Queries| Prisma[Prisma Python Client]
    Prisma -->|Pooled Connection| DB[(Supabase PostgreSQL)]
```

### **Frontend**
- **Framework**: React.js (TypeScript) + Vite
- **Styling**: Tailwind CSS + Custom Design System
- **Icons**: Lucide React
- **Internationalization**: `react-i18next`
- **HTTP Client**: Axios with JWT interceptors
- **Hosting**: [Vercel](https://vercel.com)

### **Backend**
- **Framework**: FastAPI (Python 3.11)
- **ASGI Server**: Uvicorn with lifespan management
- **ORM**: Prisma Client Python
- **AI / LLM**: Google Gemini API (`google-generativeai`)
- **Authentication**: OAuth2 Password Bearer with JWT (Python-Jose + Passlib/Bcrypt)
- **Database**: PostgreSQL (Supabase Connection Pooler)
- **Hosting**: [Render](https://render.com)

---

## 📁 Project Structure

```text
├── backend/
│   ├── auth/              # JWT authentication & security dependencies
│   ├── core/              # App configuration & settings
│   ├── database/          # Prisma database connection handlers
│   ├── routers/           # FastAPI routers (auth, curriculum, assessment, voice, etc.)
│   ├── schemas/           # Pydantic data schemas
│   ├── services/          # AI LLM, Speech evaluation, Gamification, Reports
│   ├── schema.prisma      # Prisma schema definitions
│   ├── seed_curriculum.py # Curriculum seeding script
│   └── requirements.txt   # Python production dependencies
└── frontend/
    ├── public/            # Static assets
    ├── src/
    │   ├── components/    # Modular UI components (Buttons, Cards, Modals)
    │   ├── contexts/      # AuthContext and state providers
    │   ├── lib/           # Axios instance & i18n configuration
    │   ├── locales/       # JSON localization dictionaries (en, hi, mr)
    │   └── pages/         # Dashboard, Assessment, Voice, Curriculum, Reports, Auth
    ├── tailwind.config.js # Custom color palettes & tokens
    └── package.json       # Frontend scripts & dependencies
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10 or v3.11)
- PostgreSQL (or local SQLite)
- Google Gemini API Key

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```powershell
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PROJECT_NAME="AI Literacy Platform"
   API_V1_STR="/api/v1"
   SECRET_KEY="your-super-secret-jwt-key"
   DATABASE_URL="postgresql://postgres:password@your-db-host:5432/postgres?pgbouncer=true"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

5. **Generate Prisma Client & Sync Database**:
   ```bash
   prisma generate
   prisma db push
   ```

6. **Seed Initial Curriculum & Lessons**:
   ```bash
   python seed_curriculum.py
   ```

7. **Start Backend Server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   > API Documentation (Swagger) available at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://127.0.0.1:8000/api/v1
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   > Frontend available at `http://localhost:5173`.

---

## 🌐 Production Deployment

| Service | Platform | Build Command | Start / Output |
| :--- | :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | `npm run build` | Output: `dist` |
| **Backend** | [Render](https://render.com) | `pip install -r requirements.txt && prisma generate && prisma db push` | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Database** | [Supabase](https://supabase.com) | Managed PostgreSQL | Session / Transaction Pooler on Port `5432` / `6543` |

---

## 👥 Authors & Acknowledgments

- Developed with ❤️ for Neo-Learners & Adult Literacy Empowerment.
- Live Deployment: [AI Literacy Assistant](https://ai-powered-literacy-assistant-for-n.vercel.app/)
