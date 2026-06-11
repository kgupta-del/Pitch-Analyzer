# PitchAnalyzer AI

An AI-powered web app that analyzes startup pitch videos and audio files in the style of Shark Tank — scoring the pitch, simulating investor reactions, and providing deal negotiation insights.

---

## What It Does

Upload a video or audio recording of a startup pitch and get back:

- **Pitch Score** (0–10) with an investability rating (High / Medium / Low)
- **AI Deal Analysis** — what the founder asked for, what a fair deal looks like, and what the best counter-offer would be
- **Shark Verdicts** — simulated reactions from Mark Cuban, Lori Greiner, Kevin O'Leary, Daymond John, and Robert Herjavec, including whether each would make an offer
- **Sentiment & Confidence Map** — pinpoints where the pitch was strongest and where concerns arise
- **Full Transcript** — word-level transcription of the entire pitch
- **PDF Export** — a shareable, branded report of the full analysis
- **Archive** — all past analyses saved to your account, searchable and re-viewable

---

## How It Works

```
Upload video/audio
       ↓
AssemblyAI transcribes the speech to text
       ↓
Google Gemini AI reads the transcript and generates structured analysis
       ↓
Results are saved to Firestore (text only — media never leaves your browser)
       ↓
Full report displayed: score, sharks, deals, sentiment, transcript
```

1. **You upload a file** (video or audio, up to 500 MB) on the New Analysis page.
2. **AssemblyAI** receives the file and returns a full transcript with word-level timing.
3. **Google Gemini 2.5 Flash** receives the transcript and returns a structured JSON response containing the pitch score, shark verdicts, deal terms, sentiment arc, and confidence/concern markers.
4. **Firebase Firestore** stores the analysis text data under your user account.
5. The media file is kept only as an in-memory browser URL — it is never uploaded to any database.

---

## Project Architecture

```
pitch_analyzer/
├── src/
│   ├── pages/             # Full-page views (routing targets)
│   ├── components/        # Reusable UI pieces used inside pages
│   │   ├── Analysis/      # Report-specific components
│   │   ├── Layout/        # App shell (header, sidebar, wrapper)
│   │   └── Common/        # Shared utility components
│   ├── services/          # All external API and data logic
│   ├── context/           # React context providers (auth state)
│   └── assets/            # Static images and icons
├── public/                # Favicon and public assets
├── index.html             # Single-page app HTML shell
├── vite.config.js         # Build configuration
└── package.json           # Dependencies and scripts
```

### Pages

| Page | Route | Purpose |
|---|---|---|
| `LandingPage.jsx` | `/` | Public marketing page with features and CTA |
| `AuthPage.jsx` | `/auth` | Email/password login and Google OAuth sign-in |
| `Dashboard.jsx` | `/dashboard` | Recent analyses with stats (total, avg score, high-investability count) |
| `NewAnalysis.jsx` | `/new-analysis` | File upload, 5-step progress tracker, analysis trigger |
| `AnalysisDetail.jsx` | `/analysis/:id` | Full report: media player, score, sharks, deals, sentiment, transcript |
| `Archive.jsx` | `/archive` | Searchable grid of all saved analyses |

### Services

| File | What It Does |
|---|---|
| `assemblyai.js` | Uploads file to AssemblyAI, polls until transcript is ready (up to 6 min), returns text and word-level data |
| `gemini.js` | Sends transcript to Gemini with a structured prompt; parses the JSON response into analysis data |
| `firebase.js` | Initializes Firebase Auth and Firestore with credentials from `.env` |
| `mediaStore.js` | In-memory Map that holds Blob URLs for media playback within the current session |
| `pdfExport.js` | Builds a branded PDF report using jsPDF with score cards, deal terms, shark verdicts, and transcript snippet |

### Analysis Components

| Component | What It Renders |
|---|---|
| `MediaPlayer.jsx` | Custom video/audio player with seek, mute, and time display |
| `DealEvaluation.jsx` | Three-column card: current ask / fair deal / best deal |
| `SharkVerdicts.jsx` | Five shark cards with status badge (OFFER MADE / NEGOTIATING / INTERESTED / OUT) and quote |
| `SentimentAnalysis.jsx` | Confidence markers with progress bars and concern markers with level badges |
| `SentimentChart.jsx` | Recharts bar chart showing sentiment arc across the pitch timeline |
| `TranscriptModal.jsx` | Full-screen modal with scrollable transcript text |

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Routing | React Router 7 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Charts | Recharts |
| Transcription | AssemblyAI API |
| AI Analysis | Google Gemini 2.5 Flash Lite |
| Auth & Database | Firebase (Auth + Firestore) |
| PDF Generation | jsPDF + html2canvas |
| File Upload UI | react-dropzone |

---

## Getting Started

### Prerequisites

- Node.js 18+
- API keys for: Firebase, AssemblyAI, Google Gemini

### Setup

```bash
# Install dependencies
npm install

# Create your environment file and fill in your API keys
cp .env.example .env

# Start the development server
npm run dev
```

App runs at `http://localhost:5173` by default.

### Build for Production

```bash
npm run build
# Output goes to /dist — deploy this folder to any static host
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ASSEMBLYAI_API_KEY=
VITE_GEMINI_API_KEY=
```

---

## Privacy

Media files are **never stored in the cloud**. They are sent directly to AssemblyAI for transcription and then kept only as browser-local Blob URLs for playback during the current session. Only the text data (transcript and AI analysis) is saved to Firestore.

---

## Authentication

- Email/password registration and login
- Google OAuth one-click sign-in
- All analysis routes are protected — unauthenticated users are redirected to `/auth`
- Each user's analyses are isolated by their Firebase UID
