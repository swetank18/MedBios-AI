<div align="center">

# MedBios AI

**AI-Powered Clinical Report Intelligence Platform**

[![CI](https://github.com/swetank18/MedBios-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/swetank18/MedBios-AI/actions)
[![Python 3.12+](https://img.shields.io/badge/Python-3.12+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Tests](https://img.shields.io/badge/Tests-37%2F37_passing-22c55e.svg)](backend/tests/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

*Upload a medical lab report PDF and get AI-powered clinical analysis with reasoning, risk scoring, knowledge graph, and physician-ready reports.*

</div>

---

## Key Features

| Feature | Description |
|---------|-------------|
| **PDF Analysis** | OCR + NLP extraction of 50+ lab test types |
| **Clinical Reasoning** | 13 rule engine covering 9 medical domains |
| **Risk Scoring** | Composite risk scores per organ system (0-100%) |
| **Knowledge Graph** | 96 nodes, 97 edges mapping medical relationships |
| **Drug Interactions** | 16 drug-drug pairs, 8 drug-lab classes |
| **Trend Analysis** | Longitudinal patient tracking with alerts |
| **PDF Export** | Downloadable physician-ready clinical reports |
| **Explainability** | Evidence chains linking insights to source data |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  Dashboard │ Upload │ Results │ Drug Checker │ Trends    │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
┌────────────────────────┴────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                          │
│  ┌──────────┐   ┌──────────┐   ┌───────────────┐       │
│  │ OCR      │──▶│ NLP      │──▶│ Reference     │       │
│  │ Service  │   │ Service  │   │ Ranges (50+)  │       │
│  └──────────┘   └──────────┘   └───────┬───────┘       │
│                                         │                │
│  ┌──────────────┐   ┌──────────┐   ┌───┴───────┐       │
│  │ Knowledge    │◀──│ Risk     │◀──│ Clinical  │       │
│  │ Graph (NX)   │   │ Scorer   │   │ Reasoning │       │
│  └──────────────┘   └──────────┘   └───────────┘       │
│                                                          │
│  ┌──────────────┐   ┌──────────┐   ┌───────────┐       │
│  │ Drug         │   │ Trend    │   │ PDF       │       │
│  │ Interactions │   │ Analysis │   │ Export    │       │
│  └──────────────┘   └──────────┘   └───────────┘       │
│                                                          │
│  SQLite/PostgreSQL  │  NetworkX  │  ReportLab           │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up --build
# Frontend: http://localhost:80
# Backend:  http://localhost:8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/reports/upload` | Upload PDF for analysis |
| `GET` | `/api/reports/` | List all reports |
| `GET` | `/api/reports/{id}` | Get report details |
| `GET` | `/api/reports/export/{id}/pdf` | Download PDF report |
| `GET` | `/api/reports/analytics/dashboard` | Live analytics stats |
| `GET` | `/api/reports/patient/{id}/trends` | Patient trend analysis |
| `POST` | `/api/reports/drug-interactions/check` | Drug-drug interactions |
| `POST` | `/api/reports/drug-interactions/lab-check` | Drug-lab interactions |
| `GET` | `/api/reports/knowledge-graph/stats` | Knowledge graph stats |
| `GET` | `/health` | System health check |

## Testing
```bash
cd backend
python -m pytest tests/ -v
# 37 tests passing across 9 service modules
```

## Clinical Reasoning Rules

The engine includes 13 clinical rules across 9 medical domains:

| Domain | Rules |
|--------|-------|
| Hematology | Iron deficiency anemia, B12/folate deficiency |
| Cardiovascular | Dyslipidemia, elevated LDL |
| Nephrology | CKD staging, elevated BUN/creatinine |
| Endocrinology | Diabetes (HbA1c/glucose), thyroid dysfunction |
| Hepatology | Liver enzyme elevation, hepatic injury |
| Electrolytes | Hyper/hypokalemia, calcium abnormalities |
| Immunology | Systemic inflammation (CRP/ESR) |
| Nutrition | Vitamin D deficiency, malnutrition |
| Hematology | Leukocytosis, thrombocytopenia |

## Drug Interaction Database

**16 drug-drug pairs** including:
- Warfarin + Aspirin → Increased bleeding risk
- SSRI + MAOI → Serotonin syndrome (CRITICAL)
- ACE Inhibitor + Potassium → Hyperkalemia
- Statin + Gemfibrozil → Rhabdomyolysis

**8 drug-lab classes** with expected effects on lab values.

## Project Structure

```
MedBios-AI/
├── backend/
│   ├── main.py                    # FastAPI entrypoint
│   ├── config.py                  # Configuration
│   ├── database.py                # SQLAlchemy async engine
│   ├── models.py                  # ORM models
│   ├── routers/
│   │   └── reports.py             # All API endpoints
│   ├── services/
│   │   ├── ocr_service.py         # PDF text extraction
│   │   ├── nlp_service.py         # Lab value NLP extraction
│   │   ├── reference_ranges.py    # 50+ lab test ranges
│   │   ├── reasoning_engine.py    # Clinical reasoning (13 rules)
│   │   ├── risk_scorer.py         # Organ system risk scoring
│   │   ├── knowledge_graph.py     # NetworkX medical graph
│   │   ├── explainability.py      # Evidence chain builder
│   │   ├── report_generator.py    # Clinical summary generator
│   │   ├── trend_analysis.py      # Longitudinal tracking
│   │   ├── drug_interactions.py   # Drug safety engine
│   │   └── pipeline.py            # Orchestrator
│   ├── data/
│   │   └── medical_graph_seed.json # Knowledge graph seed data
│   └── tests/
│       └── test_services.py       # 37 unit tests
├── frontend/
│   └── src/
│       ├── pages/                 # Dashboard, Upload, Results, Drug Checker, Trends
│       ├── components/            # Findings, Insights, Risk, Graph, Report
│       └── api.js                 # API client
├── Dockerfile                     # Multi-stage build
├── docker-compose.yml             # Backend + Frontend services
├── nginx.conf                     # SPA routing + API proxy
└── .github/workflows/ci.yml       # CI pipeline
```

## License

MIT License — see [LICENSE](LICENSE) for details.
