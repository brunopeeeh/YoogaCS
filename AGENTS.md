# AGENTS.md

## Cursor Cloud specific instructions

### What this is
Yooga CS Coach is a **local-first React + Vite single-page app** (frontend is the product).
It runs fully standalone in the browser using `localStorage`/`sessionStorage`; the Python
backend and any LLM/Supabase integration are **optional**. When the backend or an LLM key is
missing, the app degrades gracefully to local fallbacks — this is by design, not a failure.

### Frontend (primary service)
Standard scripts live in `package.json`; run them from the repo root:
- Dev server: `npm run dev` (Vite, port `5173`, `host: true`).
- Lint: `npm run lint` — eslint. Typecheck: `npm run typecheck` — tsc. Build: `npm run build`.
- E2E: `npx playwright test` (Playwright, chromium). The config auto-starts the dev server and
  reuses one already running, so it works whether or not `npm run dev` is already up.

Non-obvious caveats:
- `main` has pre-existing lint failures (unused imports in `src/components/simulator/SuggestionModal.jsx`)
  and one typecheck error (`BACKEND_URL` in `src/integrations/Core.ts`). These are code issues, not
  environment issues; `npm run build` still succeeds because Vite build does not run `tsc`.
- Without `VITE_GEMINI_API_KEY` the chat client, AI Coach, and audit use deterministic local
  fallbacks; mock client replies can repeat — expected offline behavior.
- Seeded test logins (created in `localStorage` on first load):
  admin `admin@yooga.com.br` / `admin123`; agent `mariana.silva@yooga.com.br` / `user123`.

### Backend (optional Python FastAPI, `backend/`)
Only needed for centralized Supabase persistence + server-side LLM. Requires `python3.12-venv`
(`sudo apt-get install -y python3.12-venv`), then a venv at `backend/.venv` with
`pip install -r backend/requirements.txt`. Run: `backend/.venv/bin/python -m uvicorn main:app
--port 8000` from `backend/`. The frontend auto-targets `http://<hostname>:8000`; without
Supabase/LLM secrets, `/api/db*` and `/api/auth/login` return errors and the frontend
transparently falls back to `localStorage` — expected. RAG (`/api/rag/*`) and the audit engine
work offline using `src/data/faq-embeddings.json`.

### Secrets (only for full online functionality, not required for dev)
Frontend: `VITE_GEMINI_API_KEY`. Backend: `GEMINI_API_KEY` or `DEEPSEEK_API_KEY`, plus
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for centralized persistence.
