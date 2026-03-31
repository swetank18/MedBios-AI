<p align="center">
  <img src="https://img.shields.io/badge/MedBios-AI-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgc3Ryb2tlPSIjMGVhNWU5IiBzdHJva2Utd2lkdGg9IjIuNSIvPjxwYXRoIGQ9Ik0xNiA4djE2TTEyIDEyaDhNMTIgMjBoOCIgc3Ryb2tlPSIjOGI1Y2Y2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==&logoColor=white" alt="MedBios AI" height="40"/>
</p>

<h1 align="center">MedBios AI</h1>

<p align="center">
  <strong>AI-Powered Clinical Report Intelligence Platform</strong><br/>
  <em>Transforming medical reports into actionable health insights for humanity</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License"/>
  <img src="https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white" alt="CI"/>
</p>

<p align="center">
  <a href="https://med-bios-ai-djn7.vercel.app/">Live Demo</a> ·
  <a href="#features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting Started</a>
</p>

---

## What is MedBios AI?

MedBios AI is an open-source clinical intelligence platform that analyzes medical lab reports using AI. Upload a PDF lab report, and MedBios extracts every lab value via OCR, detects abnormalities against 100+ reference ranges, reasons about clinical conditions using 20 clinical rules, maps findings to a medical knowledge graph, checks 30 drug interaction pairs, and generates personalized health recommendations — all in seconds.

**Built for humanity. Free and open source.**

---

## Features

### 🔬 Core Analysis Engine
- **OCR Extraction** — Extracts lab values from PDF reports with intelligent multi-pattern parsing
- **100+ Lab Test References** — Comprehensive database with 130+ name aliases for high OCR accuracy
- **Multi-Level Severity Scoring** — Every abnormal value gets a 0-100 severity score with percentage deviation
- **20 Clinical Reasoning Rules** — Detects conditions: metabolic syndrome, anemia, thyroid disorders, cardiac risk, coagulation abnormalities, pancreatic injury, PSA screening, and more

### 🧠 AI Intelligence
- **Knowledge Graph** — Medical ontology linking diseases, symptoms, lab tests, and medications
- **Smart Health Recommendations** — 15+ condition-specific databases generating personalized diet, exercise, supplement, and follow-up plans
- **AI Chat Assistant** — Context-aware chat about your report findings in natural language
- **Drug Interaction Checker** — **30 clinically significant drug-drug pairs** with 65+ medication aliases covering macrolides, aminoglycosides, PDE5 inhibitors, nitrates, anticonvulsants, and more

### 🎨 Premium Visualization
- **Animated Health Score Ring** — 60fps SVG donut with decorative tick marks, glow effects, end-dot cursor, inner rings, and risk-coded descriptions
- **Organ System Radar Chart** — Spider chart mapping risk across all body systems
- **Biomarker Heatmap** — Dense color-coded grid of all lab values with hover tooltips
- **Interactive Organ System Map** — SVG body silhouette with hover-activated glowing indicators, detail panels, and animated pulse rings for high-risk organs
- **Critical Alert Banners** — Dismissible severity-coded banners for critical findings
- **Severity Ring Chart** — SVG donut visualizing drug interaction severity distribution
- **Animated Patient Summary** — Counter animations, 6-metric strip, mini progress bar

### 🔐 Authentication System
- **Premium Login Page** — Gradient background, branded card, platform highlights, form validation
- **Sign Up Page** — 6-role selector, password strength indicator, confirm password with real-time match indicator
- **Auth Context** — localStorage session persistence, protected routes, user avatar dropdown
- **Settings & Profile** — Appearance customization, notification preferences, keyboard shortcuts, account management

### 📄 Professional Output
- **Doctor-Ready PDF Reports** — Generated clinical reports with ReportLab
- **Patient Summary Cards** — Gradient avatar, animated counters, risk badges, stacked progress bar
- **Trend Analysis** — Track health progression across multiple reports
- **Print-Optimized Styles** — Clean print output for physical copies

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React 19 Frontend                      │
│  Dashboard · Upload · Results · Drug Checker · Settings   │
│  25+ Premium Components · Tailwind CSS v4                 │
├─────────────────────────────────────────────────────────┤
│                    FastAPI Backend                         │
│  REST API · SQLAlchemy ORM · Async I/O                    │
├──────────────┬─────────────────┬────────────────────────┤
│  OCR Engine  │  NLP Pipeline   │  Knowledge Graph         │
│  PyMuPDF     │  Reference      │  Medical Ontology        │
│  Tesseract   │  Ranges (100+)  │  Diseases/Symptoms       │
├──────────────┴─────────────────┴────────────────────────┤
│               AI Services Layer                           │
│  20 Clinical Rules · 30 Drug Pairs · Risk Scoring         │
│  Recommendations · Trend Analysis · Report Generation     │
├─────────────────────────────────────────────────────────┤
│               SQLite / PostgreSQL                         │
│  Patients · Reports · Lab Results · Insights              │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Recharts, Axios |
| **Backend** | Python 3.12+, FastAPI, SQLAlchemy (async), Pydantic |
| **OCR** | PyMuPDF (fitz), Tesseract OCR |
| **Database** | SQLite (dev), PostgreSQL (prod) |
| **PDF Export** | ReportLab |
| **Auth** | Session-based (frontend), JWT-ready (backend) |
| **Deployment** | Vercel (frontend), Render (backend), Docker |
| **CI/CD** | GitHub Actions (lint, test, build, security audit) |

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- Tesseract OCR (optional, for scanned PDFs)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` — the frontend connects to the backend automatically.

### Run Tests

```bash
cd backend
python -m pytest tests/ -v --tb=short
```

### Environment Variables

```env
# Backend
DATABASE_URL=sqlite+aiosqlite:///./medbios.db
CORS_ORIGINS=http://localhost:5173,https://your-domain.com
GOOGLE_API_KEY=your-gemini-key  # Optional: for AI chat features

# Frontend (Vercel)
VITE_API_URL=https://your-backend.onrender.com
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/reports/upload` | Upload PDF for analysis |
| `GET` | `/api/reports/` | List all reports |
| `GET` | `/api/reports/{id}` | Get report details |
| `GET` | `/api/reports/{id}/recommendations` | AI health recommendations |
| `POST` | `/api/reports/{id}/chat` | Chat with report |
| `POST` | `/api/reports/drug-interactions/check` | Drug interaction check |
| `GET` | `/api/reports/analytics/dashboard` | Dashboard analytics |
| `GET` | `/api/reports/export/{id}/pdf` | Download PDF report |
| `GET` | `/api/reports/knowledge-graph/stats` | Knowledge graph statistics |

---

## Component Library (25+)

| Component | Description |
|-----------|-------------|
| `HealthScoreRing` | Multi-ring SVG donut with tick marks, glow, and end-dot cursor |
| `SystemRadarChart` | Recharts radar chart for organ system risks |
| `BiomarkerHeatmap` | Color-coded grid with hover tooltips |
| `CriticalAlerts` | Dismissible severity-coded alert banners |
| `PatientSummaryCard` | Animated counters, 6 metrics, stacked progress bar |
| `OrganSystemVis` | Interactive SVG body map with hover detail panels |
| `HealthRecommendations` | Expandable accordion with diet/exercise/supplements |
| `ReportChat` | Floating AI chat panel with typing indicators |
| `AbnormalFindings` | Sortable lab table with severity bars |
| `ClinicalInsights` | Evidence-based clinical condition cards |
| `RiskScores` | System-level risk progress bars with animated filling |
| `KnowledgeGraphViz` | Interactive knowledge graph visualization |
| `DoctorReport` | Comprehensive clinical report with 20-rule + 30-pair stats |
| `SkeletonLoader` | 6 types: card, stats, hero, table, heatmap, profile, chat |
| `ToastProvider` | 4-type notification system |
| `SeverityRing` | SVG donut for drug interaction severity distribution |
| `Login` | Premium login with gradient orbs and platform highlights |
| `Signup` | Premium signup with password strength and role selector |
| `Settings` | 5-section settings: Profile, Appearance, Notifications, Shortcuts, About |

---

## Deployment

### Render (Backend)
1. Connect GitHub repo → set root directory to `backend`
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add env vars: `DATABASE_URL`, `CORS_ORIGINS`

### Vercel (Frontend)
1. Connect GitHub repo → set root directory to `frontend`
2. Framework preset: Vite
3. Add env var: `VITE_API_URL=https://your-backend.onrender.com`

---

## CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow:

- **Backend**: Python lint (Ruff), tests (pytest), type checking (pyright)
- **Frontend**: ESLint, production build with artifact upload
- **Security**: npm audit + safety checks
- **Deployment gate**: All checks must pass before release

---

## License

MIT License — free to use, modify, and distribute.

---

<p align="center">
  <strong>Built with AI, for humanity.</strong><br/>
  <em>MedBios AI is for informational purposes only. Always consult your healthcare provider.</em>
</p>
