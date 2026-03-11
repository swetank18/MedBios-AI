# MedBios AI

**AI-powered clinical report intelligence platform**

MedBios is an advanced medical AI system that extracts clinical data from medical reports, detects abnormalities, performs clinical reasoning, and generates physician-ready summaries with explainable evidence chains.

## Architecture

```
medbios/
├── frontend/          React dashboard (Vite)
│   └── src/
│       ├── pages/     Dashboard, Upload, Results
│       └── components/ Findings, Insights, Graph, Report
│
├── backend/           FastAPI service
│   ├── services/
│   │   ├── ocr_service.py          PDF text extraction
│   │   ├── nlp_service.py          Lab value extraction & NLP
│   │   ├── reference_ranges.py     50+ lab test reference ranges
│   │   ├── reasoning_engine.py     13 clinical inference rules
│   │   ├── risk_scorer.py          Organ system risk scoring
│   │   ├── explainability.py       Evidence chain builder
│   │   ├── report_generator.py     Physician-ready reports
│   │   ├── knowledge_graph.py      Medical knowledge graph
│   │   └── pipeline.py             8-stage pipeline orchestrator
│   ├── routers/
│   │   └── reports.py              REST API endpoints
│   ├── data/
│   │   └── medical_graph_seed.json 100+ nodes, 115+ edges
│   ├── models.py                   Database ORM models
│   ├── database.py                 SQLAlchemy async engine
│   ├── config.py                   Configuration
│   └── main.py                     FastAPI entrypoint
```

## Key Features

| Feature | Description |
|---------|-------------|
| **Clinical Reasoning Engine** | 13 rule-based clinical inference rules covering hematology, cardiovascular, nephrology, endocrinology, hepatology, thyroid, electrolytes |
| **Medical Knowledge Graph** | NetworkX graph with 100+ nodes and 115+ edges encoding medical relationships |
| **Multimodal Pipeline** | 8-stage pipeline: OCR → NLP → Abnormal Detection → Reasoning → Risk Scoring → Knowledge Graph → Explainability → Report |
| **Explainability System** | Transparent evidence chains: Observation → Rule → Conclusion with source references |
| **Doctor-Ready Reports** | Structured clinical summaries with abnormal findings, risk scores, and recommendations |
| **50+ Lab Tests** | Reference ranges with severity classification (normal, low, high, critical) |

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Analysis Pipeline

```
Upload Medical Report (PDF)
        ↓
    OCR Extraction
        ↓
    NLP Processing (lab value extraction)
        ↓
    Abnormal Detection (reference range comparison)
        ↓
    Clinical Reasoning (13 inference rules)
        ↓
    Risk Scoring (per organ system)
        ↓
    Knowledge Graph (downstream risk inference)
        ↓
    Explainability (evidence chain construction)
        ↓
    Report Generation (physician-ready summary)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/upload` | Upload PDF for analysis |
| GET | `/api/reports/` | List all reports |
| GET | `/api/reports/{id}` | Get report details |
| GET | `/api/reports/knowledge-graph/stats` | Graph statistics |
| GET | `/api/reports/knowledge-graph/query/{entity}` | Query graph |

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, pdfplumber, NetworkX
- **Frontend**: React, Vite, Recharts, react-force-graph-2d
- **Database**: SQLite (dev) / PostgreSQL (prod)

## Disclaimer

This system is for **educational and informational purposes only**. It is not a certified medical device. All outputs must be reviewed by qualified healthcare professionals.
