# Amber’s Portfolio Café — V56 live AI integration

## What is new

The waitress sprite now opens an **AI-powered** chat that uses a server-side OpenAI Responses API request and an on-server retrieval index sourced from the portfolio, résumé, original approved Q&A, About blurbs, personal voice notes, and historical behavioral responses. The original sources remain intact in the package and the complete provenance-aware copies live in `server/sources.json` (not served to visitors). Older Calendly-era interview answers are flagged as historical. This is retrieval-augmented generation (RAG), not fine-tuning.

The existing café, case studies, music, arcade games, profile photo, and three starter questions are preserved. The UI uses the existing café modal, supports Enter to send and Shift+Enter for a newline, Escape to close, a typing indicator, concise message bubbles, and contextual case-study links.

## Run locally on macOS

1. Install **Node.js 20 or newer** (https://nodejs.org). No extra npm modules are required.
2. Copy `.env.example` to `.env` and insert an **OpenAI API key** in `OPENAI_API_KEY`. Keep `.env` private. Choose an available model in `OPENAI_MODEL`.
3. Double-click `start-cafe.command` (macOS may ask you to approve the downloaded script via right-click → Open). This opens `http://127.0.0.1:4173/`.
4. Walk to Amber/the waitress and interact; try the three starter questions and custom follow-ups. A working Internet connection, funded API account, and model access are required.

**Do not open `index.html` directly as a `file://` URL for AI chat.** It requires the server endpoint. The other café assets can still be opened offline, but the AI connection will show an unavailable message.

## Hosting for public visitors

Deploy the whole project to a host that supports a **persistent Node server**. Configure `OPENAI_API_KEY` as a server-side environment variable (not in source control), select the model, and serve the app behind HTTPS. Configure `HOST=0.0.0.0` and `PORT` as required by the host. A static-only host such as GitHub Pages cannot run this server; you would need an external API service and update the frontend accordingly.

Use production-grade edge rate limiting, abuse controls, monitoring, spending alerts, and a reverse proxy before opening the endpoint publicly. The server has a basic per-IP 40-requests-per-hour throttle, request-size limit, same-origin check, 25-second API timeout, and no chat transcript storage, but these are **not** a substitute for production hardening. `store:false` is passed to the Responses API. Check your provider’s data retention and privacy terms separately. The source archive is blocked from being served over HTTP.

## Sources and freshness

`server/sources.json` includes full source records plus indexed passages. The on-server retrieval algorithm ranks relevant passages by text overlap and applies source-priority metadata; the model receives only selected relevant excerpts and recent chat history. This version uses **local lexical retrieval**, not embeddings. For scaling and better semantic recall, add embeddings/vector search or a managed file-search index. The index can be regenerated when portfolio content changes. A newer portfolio blurb takes precedence over outdated interview answers; do not attribute older job-search explanations to Amber today.

The AI is instructed not to invent background or metrics; however, **generative models can still make mistakes**. Review it before recruiting use, and test contested metrics or follow-up questions. Example questions: “What did you learn from your pricing tests?”, “What was the hardest part of the homepage redesign?”, “Why did you choose to test both concepts?”, “Tell me about a time you made a mistake”, “How does your research background influence your strategy?”

## API and test endpoint

- `GET /api/status` — shows whether the server has an API key (not whether the remote provider will accept it).
- `POST /api/chat` — JSON `{ "message": "...", "history": [{"role":"user","content":"..."},...] }`. Returns `{ "answer": "...", "relatedProject": {"title":"...","url":"..."}|null, "sourceIds":[...] }`.
- `.env` is blocked from static serving. Never expose `OPENAI_API_KEY` in browser assets.

## Operational limits

An API key has **not** been included or connected in this package, and no real model invocation was performed during creation. The server code and endpoint have been locally tested using a stub response; live service behavior requires deployment and your API credentials.
