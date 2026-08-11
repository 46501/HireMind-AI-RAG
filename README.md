<div align="center">
  <img src="frontend/public/logo-light.png" alt="HireMind AI Logo" width="400"/>
</div>

# HireMind AI 🚀 AI Career Assistant

HireMind AI is a production-ready AI-Powered Career Assistant platform built using React (Vite), FastAPI, ChromaDB, and Google Gemini. The platform uses a Retrieval-Augmented Generation (RAG) engine to provide intelligent career advice, parse resumes, identify skill gaps, and generate roadmaps.

## 🚀 Features
- **Knowledge Base (RAG):** Upload PDFs, DOCX, and TXT files (e.g., Interview Experiences, Notes). The system chunks, embeds, and stores them in a local ChromaDB for semantic search and AI Q&A.
- **Resume ATS Analyzer:** Analyzes resumes against Job Descriptions, providing a score breakdown and actionable suggestions.
- **AI Career Roadmap:** Generates personalized 30-day, 90-day, and 6-month learning roadmaps based on current skills and target roles.
- **Modern SaaS UI:** Built with React, Tailwind CSS, and Framer Motion, featuring glassmorphism elements, dark mode, and responsive design.

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS v3, Framer Motion, React Router, Lucide React
- **Backend:** Python, FastAPI, Uvicorn, Pydantic
- **AI & Vector DB:** Google Gemini API (`google-generativeai`), ChromaDB (Local Persistent)

---

## ⚙️ Setup Instructions

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:
```bash
cd backend
```

**Create and activate a virtual environment:**
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Configure Environment Variables:**
Open `backend/.env` and add your Gemini API Key:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

**Run the Backend Server:**
```bash
uvicorn main:app --reload
```
The FastAPI backend will start on `http://127.0.0.1:8000`. You can access the auto-generated API docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
```

**Install dependencies:**
```bash
npm install
```

**Run the Frontend Development Server:**
```bash
npm run dev
```
The React frontend will start on `http://localhost:5173`.

---

## 📁 Project Architecture

- `backend/`: FastAPI application containing routers, core logic, ChromaDB setup, and LLM services.
  - `api/`: API routes (upload, chat, resume, roadmap).
  - `db/`: ChromaDB client initialization.
  - `services/`: RAG orchestration and Gemini LLM interactions.
  - `utils/`: Intelligent document chunking and parsing.
- `frontend/`: React Vite application.
  - `src/components/`: Reusable UI components (Sidebar, Layout).
  - `src/pages/`: Main application views (Dashboard, KnowledgeBase, etc.).
  - `src/services/`: Axios API wrappers.

---
*Developed as a comprehensive, scalable AI Career Platform.*
