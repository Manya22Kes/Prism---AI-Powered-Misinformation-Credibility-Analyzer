# Prism Frontend Console

<div align="center">

[![Version](https://img.shields.io/badge/version-4.2.0-cyan.svg)](https://github.com/Manya22Kes/Prism---AI-Powered-Misinformation-Credibility-Analyzer)
[![Framework](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Bundler](https://img.shields.io/badge/Vite-8.1-9333ea.svg)](https://vitejs.dev/)
[![Styling](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![3D%20Graphics](https://img.shields.io/badge/Three.js-R3F-black.svg)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](../LICENSE)

*The high-performance, interactive client application for the Prism AI Multi-Modal Credibility & Misinformation Analysis Platform.*

<br />

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Launch%20Client-00f2fe?style=for-the-badge)](https://your-deployed-app-link.here)

</div>

---

## 🧭 Overview

The **Prism Frontend** is an investigative intelligence workstation designed to make complex credibility metrics, atomic claim breakdowns, and multi-source contradiction analyses immediately legible and actionable. 

Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Three.js**, the console combines a responsive glassmorphic aesthetic with an ambient, real-time 3D mascot that reacts dynamically to ingestion, processing, reading, and archival states.

---

## 🖥️ Pages & Views

| Route | Page Component | Description |
| :--- | :--- | :--- |
| `/` | `UploadWorkspace.jsx` | Multi-modal drag-and-drop workspace (Text, URL, Document, Audio, Batch, Video preview) with real-time SSE pipeline animation, rotating intelligence telemetry, and cluster latency monitors. |
| `/report/:id` | `ReportView.jsx` | Comprehensive credibility dossier displaying the calibrated 0–100 gauge, claim investigations, bias indicators, fallacies, risk markers, distraction-free Reading Mode, and PDF dossier exports. |
| `/batch/:id` | `BatchDashboard.jsx` | Cross-source consensus dashboard featuring interactive contradiction graphs, claim comparisons, and divergence metrics across multiple documents. |
| `/archive` | `AnalysisArchive.jsx` | Searchable historical repository of all processed analyses with instant filtering by date, source type, and pin status. |
| `/saved` | `SavedReports.jsx` | Dedicated bookmarked dossiers view with quick collection assignment and comparative analysis triggers. |
| `/collections` | `Collections.jsx` | Custom investigation workspaces allowing analysts to aggregate related individual and batch reports into organized case dossiers. |
| `/collection/:id` | `CollectionDetail.jsx` | In-depth collection inspector with aggregated stats, item management, and batch export actions. |
| `/watchlist` | `Watchlist.jsx` | Active threat-monitoring console tracking sensitive URLs and domains with periodic automated change sweeps. |
| `/mission-control`| `MissionControl.jsx` | Real-time system operations dashboard showcasing server capacity, memory utilization, throughput graphs, and live experience logs. |
| `/activity` | `Activity.jsx` | Chronological audit log capturing all report generations, watchlist mutations, and collection actions. |
| `/api-status` | `APIStatus.jsx` | Real-time subsystem health monitor tracking database latency, OCR availability, and AI engine response times. |
| `/settings` | `SettingsView.jsx` | System preferences managing theme modes (Dark/Light), reduced motion accessibility, and auto-refresh intervals. |
| `/docs` | `Documentation.jsx` | Embedded, interactive technical documentation viewer with markdown support and live hash navigation. |

---

## 🕹️ Global Modals & Utilities

- **Global Search (`Cmd+K` / `Ctrl+K`)**: Instant search across all analyzed articles, domains, and extracted claim assertions via `GlobalSearchModal.jsx`.
- **Side-by-Side Comparison Modal**: Comparative multi-report inspector (`ComparisonModal.jsx`) allowing analysts to evaluate score divergences and contradicting claims between 2–4 documents simultaneously.
- **Export Engine (`pdfExport.js`)**: Generates vector-sharp, publication-ready PDF intelligence briefs via `jspdf` and `html2canvas`.

---

## 🎨 3D Graphics & Mascot Architecture

The client features an ambient, real-time 3D canvas built on **React Three Fiber (`@react-three/fiber`)** and **Drei (`@react-three/drei`)**:
- **`PrismMascot.jsx`**: An interactive crystalline polyhedron that rotates, breathes, and physically reflects active analysis states:
  - `idle`: Gentle ambient hover in the workspace header.
  - `processing`: Energetic particle acceleration and pulsing illumination during active Gemini synthesis.
  - `reading`: Smoothly parks in the peripheral margin during reading mode.
  - `vault`: Subdued ambient glow in the archive and saved dossier views.
- **`CinematicLayer.jsx`**: Manages interactive particles, camera transitions, and environmental depth of field.
- **Accessibility**: Honors `prefers-reduced-motion` and user settings via `reducedMotion` state, locking animations to subtle static glows when requested.

---

## 🧩 State Management

The frontend leverages specialized **Zustand** stores for predictable, lightweight state coordination:
- **`experienceStore.js`**: Controls current environmental profile, active pipeline stages, and reading mode toggles.
- **`cinematicStore.js`**: Dictates 3D mascot scale, 3D coordinate positioning, particle speed, and fog density.
- **`settingsStore.js`**: Persists user preferences and synchronizes with the backend settings API.
- **`themeStore.js`**: Manages dark/light theme switching and CSS variables tokens.
- **`comparisonStore.js`**: Tracks active reports selected for cross-report comparison.

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file from the provided template:
```bash
cp .env.example .env
```
Ensure `VITE_API_URL` matches your backend gateway:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Development Server
```bash
npm run dev
```
*Accessible by default at `http://localhost:5173`.*

### 4. Production Build & Verification
```bash
# Run ESLint validation
npm run lint

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License

Licensed under the **MIT License** — see [LICENSE](../LICENSE) for details.
