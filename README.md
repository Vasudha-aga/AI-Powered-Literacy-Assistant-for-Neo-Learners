# AI Powered Literacy Assistant for Neo Learners

An intelligent, multilingual literacy platform designed to help adult "neo-learners" assess their literacy levels, track their progress, and follow a personalized learning path. The platform utilizes AI (Large Language Models) to evaluate reading, writing, and speaking skills and provides comprehensive feedback tailored to the learner's abilities.

## Features
- **Multilingual Support**: Fully localized in English, Hindi (हिन्दी), and Marathi (मराठी). The entire UI, including assessments and learning paths, switches dynamically.
- **Diagnostic Literacy Assessment**:
  - **Reading**: Multiple-choice questions to test basic comprehension.
  - **Writing**: Free-text prompt evaluated by AI for grammar, spelling, and coherence.
  - **Speaking**: Voice recording evaluated by AI for pronunciation and fluency.
- **AI-Powered Evaluation**: Computes individual scores out of 10 and assigns an overall literacy level (Beginner, Intermediate, Advanced) along with detailed feedback.
- **Personalized Dashboard**: Track learning streaks, daily goals, assessment history, and recommended learning roadmaps.

## Tech Stack
### Frontend
- React.js + TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- `react-i18next` (Internationalization)
- Lucide React (Icons)

### Backend
- FastAPI (Python Framework)
- Prisma (ORM for database interactions)
- PostgreSQL (or SQLite for local dev)
- Google Gemini API (for AI evaluation)

## Project Structure
```text
.
├── backend/            # FastAPI python application
│   ├── core/           # Configuration and settings
│   ├── auth/           # Authentication logic (JWT)
│   ├── routers/        # API endpoints (Auth, Assessment)
│   ├── services/       # LLM integrations for evaluating text & speech
│   └── prisma/         # Prisma schema and migrations
└── frontend/           # React + Vite application
    ├── src/
    │   ├── components/ # Reusable UI components (Cards, etc.)
    │   ├── contexts/   # React contexts (AuthContext)
    │   ├── lib/        # Axios API configurations and i18n
    │   ├── locales/    # JSON translation files (en, hi, mr)
    │   └── pages/      # Views (Dashboard, Quiz, Settings, Signup, etc.)
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- A PostgreSQL database (or you can use SQLite by default)
- Gemini API Key

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On Mac/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables. Create a `.env` file in the `backend` folder:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/literacy_db"
   GEMINI_API_KEY="your_gemini_api_key_here"
   SECRET_KEY="your_jwt_secret_here"
   ```
5. Generate the Prisma client and push the database schema:
   ```bash
   prisma generate
   prisma db push
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Usage
1. Open the frontend in your browser.
2. Sign up for a new account (you can select your preferred language here).
3. Log in to access the Dashboard.
4. Click on **Diagnostic Assessment** to begin the reading, writing, and speaking tests.
5. Review your detailed results and follow the suggested learning path!
