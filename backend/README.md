# Prism Backend Engine

<div align="center">

[![Version](https://img.shields.io/badge/version-4.2.0-green.svg)](https://github.com/Manya22Kes/Prism---AI-Powered-Misinformation-Credibility-Analyzer)
[![Runtime](https://img.shields.io/badge/Node.js-20+-brightgreen.svg)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)
[![AI Engine](https://img.shields.io/badge/Google%20Gemini-3.7%20Flash-blue.svg)](https://deepmind.google/technologies/gemini/)
[![Database](https://img.shields.io/badge/MongoDB-Mongoose%209-47a248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](../LICENSE)

*The multi-modal ingestion, analytical reasoning, and data persistence engine for the Prism AI Credibility Intelligence Platform.*

<br />

[![Live API Gateway](https://img.shields.io/badge/⚡%20Live%20API-Active%20Gateway-10b981?style=for-the-badge)](https://your-deployed-backend-link.here)

</div>

---

## 🧭 Overview

The **Prism Backend** provides the core analytical infrastructure for decomposing, verifying, and scoring unstructured digital content. Built on **Node.js (ES Modules)** and **Express 5**, the backend exposes REST and Server-Sent Events (SSE) interfaces that ingest diverse content streams, normalize them into standardized textual payloads, and invoke **Google Gemini 3.7 Flash** to perform atomic claim verification, bias identification, and logical fallacy detection.

---

## 🏛️ Directory Structure

```text
backend/
├── credentials/                 # Secure directory for GCP service account keys (git-ignored)
├── docs/                        # API endpoint documentation (api.md)
├── sample-files/                # PPTX test fixtures (basic, notes, tables, images)
├── server/
│   ├── config/                  # MongoDB database initialization & connection handling
│   ├── controllers/             # Express controllers (analysis, batch, history, collections, etc.)
│   ├── evaluation/              # 30-case benchmark evaluation harness and evaluator runner
│   ├── middlewares/             # Security headers, rate limiting, error handling, ObjectId validator
│   ├── models/                  # Mongoose schemas (AnalysisReport, BatchAnalysisReport, Collection, etc.)
│   ├── processors/              # Content extractors (text, url, pdf, image, audio, docx, pptx, batch)
│   ├── prompts/                 # Specialized system prompts for single and multi-document analysis
│   ├── routes/                  # Express route definitions grouped by domain
│   ├── schemas/                 # Zod validation schemas for structured metadata
│   ├── services/                # Gemini AI service, OCR engine, Speech-to-Text, Activity logger
│   ├── tests/                   # Official integration tests (batch, image, pdf)
│   ├── utils/                   # Shared helpers and custom error classes
│   ├── app.js                   # Express application setup, middleware stack, route mounting
│   ├── index.js                 # Process lifecycle and HTTP server bootstrapping
│   └── server.js                # Core server initialization entry point
├── CHANGELOG.md                 # Version release notes
├── RECOVERY.md                  # Database disaster recovery and backup runbook
└── package.json                 # Backend dependencies and scripts
```

---

## ⚡ Multi-Modal Ingestion Pipeline

Prism ingests content across seven primary modalities through dedicated processors located in `server/processors/`:

1. **Raw Text (`processors/text`)**: Immediate character and sentence segmentation.
2. **Live Web URLs (`processors/url`)**: Scrapes DOM via Cheerio and extracts clean article body content using Mozilla Readability with metadata attribution.
3. **Documents (`processors/pdf`, `docx`, `pptx`)**:
   - **PDF**: Stream-extracts native text using `pdfjs-dist` and `pdf-lib`. If pages are scanned images, automatically falls back to OCR.
   - **DOCX**: Parses Word document XML structures using `mammoth`.
   - **PPTX**: Inspects slide XML, embedded speaker notes, and tabular structures via `jszip`. Test fixtures are located in `sample-files/`.
4. **Images (`processors/image`)**: Dual-engine OCR utilizing Google Cloud Vision API with automatic fallback to local `tesseract.js`.
5. **Audio (`processors/audio`)**: Transcribes spoken content using Google Cloud Speech-to-Text with local metadata extraction via `music-metadata`.
6. **Batch Synthesis (`processors/batch`)**: Aggregates up to 10 files simultaneously, extracting common threads, consensus agreements, and direct contradictions.

---

## 🤖 Gemini 3.7 Flash Claim-Centric Reasoning

Once content is normalized, it is passed to `services/analysis.service.js` which interfaces with `@google/genai`:
- **Atomic Claim Extraction**: Separates rhetorical statements from verifiable factual claims.
- **Evidence Cross-Referencing**: Evaluates citation credibility and identifies debunked or unsubstantiated points.
- **Manipulation & Bias Telemetry**: Quantifies emotional framing, loaded terminology, and logical fallacies.
- **Calibrated Scoring Matrix**: Synthesizes scores across four objective dimensions:
  - Factual Accuracy (35%)
  - Source Transparency (25%)
  - Logical Coherence (25%)
  - Neutrality & Non-Manipulation (15%)

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/analyze/text` | Ingest and analyze raw text payload (SSE Stream) |
| `POST` | `/api/v1/analyze/url` | Scrape and analyze live URL (SSE Stream) |
| `POST` | `/api/v1/analyze/pdf` | Upload and analyze PDF document (SSE Stream) |
| `POST` | `/api/v1/analyze/image` | Upload and analyze image via OCR (SSE Stream) |
| `POST` | `/api/v1/analyze/audio` | Upload and analyze spoken audio file (SSE Stream) |
| `POST` | `/api/v1/analyze/docx` | Upload and analyze Word document (SSE Stream) |
| `POST` | `/api/v1/analyze/pptx` | Upload and analyze PowerPoint presentation (SSE Stream) |
| `POST` | `/api/v1/analyze/batch` | Upload and synthesize up to 10 documents (SSE Stream) |
| `POST` | `/api/v1/analyze/reanalyze/:id` | Re-evaluate an existing report with fresh parameters |
| `GET`  | `/api/v1/history` | Paginated search and retrieval of stored analyses |
| `GET`  | `/api/v1/history/report/:id` | Fetch full report data by MongoDB ObjectId |
| `PATCH`| `/api/v1/history/report/:id/pin`| Toggle pin status on a report |
| `PATCH`| `/api/v1/history/report/:id/save`| Toggle saved/bookmarked status on a report |
| `DELETE`| `/api/v1/history/report/:id`| Permanently delete a report from the database |
| `GET`  | `/api/v1/collections` | List all investigative collections |
| `POST` | `/api/v1/collections` | Create a new investigative collection |
| `GET`  | `/api/v1/watchlist` | Retrieve active threat-monitoring watchlist items |
| `POST` | `/api/v1/watchlist` | Register a new target URL/domain for tracking |
| `GET`  | `/api/v1/mission-control` | Aggregated system health and telemetry metrics |
| `GET`  | `/api/v1/health` | Health check for database, AI model, and OCR engines |

---

## 🧪 Benchmark Evaluation Suite

Prism includes an offline benchmark evaluation harness in `server/evaluation/` containing 30 real-world test cases covering medical misinformation, financial rumors, scientific announcements, and satire:

```bash
# Run full 30-case evaluation benchmark
npm run evaluate

# Run with a limit on test cases
npm run evaluate -- --limit=5

# Tune retry parameters
npm run evaluate -- --limit=5 --maxRetries=2 --retryBaseMs=3000
```

Results are saved as timestamped Markdown and JSON reports in `server/evaluation/results/`.

---

## 🚀 Running the Backend

### Via Docker (Part of full stack)
From the repository root:
```bash
docker compose up backend -d
```

---

### Locally via Node.js

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Supply your configuration in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/prism
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.7-flash
GOOGLE_APPLICATION_CREDENTIALS=./credentials/your_service_account_key.json
```

### 3. Start Development Server
```bash
npm run dev
```
*Server initializes with nodemon on `http://localhost:5000`.*

---

## 📄 License

Licensed under the **MIT License** — see [LICENSE](../LICENSE) for details.
