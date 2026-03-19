<p align="center">
  <img src="https://img.shields.io/badge/MedBios-AI-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgc3Ryb2tlPSIjMGVhNWU5IiBzdHJva2Utd2lkdGg9IjIuNSIvPjxwYXRoIGQ9Ik0xNiA4djE2TTEyIDEyaDhNMTIgMjBoOCIgc3Ryb2tlPSIjOGI1Y2Y2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==&logoColor=white" alt="MedBios AI" height="40"/>
</p>

<h1 align="center">MedBios AI</h1>

<p align="center">
  <strong>AI-Powered Clinical Report Intelligence Platform</strong><br/>
  <em>Transforming medical reports into actionable health insights for humanity</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License"/>
</p>

<p align="center">
  <a href="https://med-bios-ai-djn7.vercel.app/">Live Demo</a> ·
  <a href="#features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting Started</a>
</p>

---

## What is MedBios AI?

MedBios AI is an open-source clinical intelligence platform that analyzes medical lab reports using AI. Upload a PDF lab report, and MedBios extracts every lab value via OCR, detects abnormalities against 100+ reference ranges, reasons about clinical conditions, maps findings to a medical knowledge graph, and generates personalized health recommendations — all in seconds.

**Built for humanity. Free and open source.**

---

## Features

### Core Analysis Engine
- **OCR Extraction** — Extracts lab values from PDF reports with intelligent parsing
- **100+ Lab Test References** — Comprehensive database with 130+ name aliases for high OCR accuracy
- **Multi-Level Severity Scoring** — Every abnormal value gets a 0-100 severity score with percentage deviation
- **Clinical Reasoning Engine** — 13+ clinical rules detect conditions like metabolic syndrome, anemia patterns, thyroid disorders

### AI Intelligence
- **Knowledge Graph** — Medical knowledge graph linking diseases, symptoms, lab tests, and medications
- **Smart Health Recommendations** — 15+ condition-specific databases generating personalized diet, exercise, supplement, and follow-up plans
- **AI Chat Assistant** — Ask questions about your report findings in natural language
- **Drug Interaction Checker** — Check 16+ known drug-drug and drug-lab interaction pairs

### Premium Visualization
- **Animated Health Score Ring** — 60fps SVG donut with glow effects and color-coded risk
- **Organ System Radar Chart** — Spider chart mapping risk across all body systems
- **Biomarker Heatmap** — Dense color-coded grid of all lab values with hover tooltips
- **Organ System Visualizer** — SVG body silhouette with glowing risk indicators
- **Critical Alert Banners** — Dismissible severity-coded banners for critical findings

### Professional Output
- **Doctor-Ready PDF Reports** — Generated clinical reports with ReportLab
- **Patient Summary Cards** — Gradient avatar, risk badges, quick metrics
- **Trend Analysis** — Track health progression across multiple reports
- **Print-Optimized Styles** — Clean print output for physical copies

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                      │
│  Dashboard · Upload · Report View · Drug Checker      │
│  20+ Premium Components · Tailwind CSS v4             │
├─────────────────────────────────────────────────────┤
│                   FastAPI Backend                      │
│  REST API · SQLAlchemy ORM · Async I/O                │
├──────────────┬────────────────┬──────────────────────┤
│  OCR Engine  │  NLP Pipeline  │  Knowledge Graph      │
│  PyMuPDF     │  Reference     │  Medical Ontology     │
│  Tesseract   │  Ranges (100+) │  Diseases/Symptoms    │
├──────────────┴────────────────┴──────────────────────┤
│              AI Services Layer                        │
│  Clinical Reasoning · Risk Scoring · Recommendations  │
│  Drug Interactions · Trend Analysis · Report Gen      │
├─────────────────────────────────────────────────────┤
│              SQLite / PostgreSQL                      │
│  Patients · Reports · Lab Results · Insights          │
└─────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS v4, Recharts, Axios |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy (async), Pydantic |
| **OCR** | PyMuPDF (fitz), Tesseract OCR |
| **Database** | SQLite (dev), PostgreSQL (prod) |
| **PDF Export** | ReportLab |
| **Deployment** | Vercel (frontend), Render (backend), Docker |
| **CI/CD** | GitHub Actions |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
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

### Environment Variables

```env
# Backend
DATABASE_URL=sqlite+aiosqlite:///./medbios.db
CORS_ORIGINS=http://localhost:5173,https://your-domain.com
GOOGLE_API_KEY=your-gemini-key  # Optional: for AI features

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

## Component Library (20+)

| Component | Description |
|-----------|-------------|
| `HealthScoreRing` | Animated SVG donut ring with glow and risk color |
| `SystemRadarChart` | Recharts radar chart for organ system risks |
| `BiomarkerHeatmap` | Color-coded grid with hover tooltips |
| `CriticalAlerts` | Dismissible severity-coded alert banners |
| `PatientSummaryCard` | Gradient avatar, risk badge, metrics strip |
| `OrganSystemVis` | SVG body silhouette with risk indicators |
| `HealthRecommendations` | Expandable accordion with diet/exercise/supplements |
| `ReportChat` | Floating AI chat panel with typing indicators |
| `AbnormalFindings` | Sortable lab table with severity bars |
| `ClinicalInsights` | Evidence-based clinical condition cards |
| `RiskScores` | System-level risk progress bars |
| `KnowledgeGraphViz` | Interactive knowledge graph visualization |
| `DoctorReport` | Comprehensive clinical report view |
| `SkeletonLoader` | Multi-type shimmer loading states |
| `ToastProvider` | 4-type notification system |

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

## License

MIT License — free to use, modify, and distribute.

---

<p align="center">
  <strong>Built with AI, for humanity.</strong><br/>
  <em>MedBios AI is for informational purposes only. Always consult your healthcare provider.</em>
</p>
