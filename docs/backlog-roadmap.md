# Project Backlog and Roadmap

This document lists the backlog tickets and the planned sprint order for the Cursor Learning platform.

## Recent Updates

**December 2024:**

- Added pre-commit hooks with Husky + lint-staged for automatic Prettier formatting (0-3)
- Enhanced grading feedback to provide contextual responses instead of redundant confirmations (5-6)
- Improved practice view UI with separate verdict/feedback display and support for all verdict types (6-9)
- Fixed formatting issues across codebase (AGENT.md, README.md, server/src/llm/grader.ts)

## Backlog

The backlog is organized by feature area. Each ticket has an ID used for reference.

### 0 · Project scaffolding

| ID  | Title                                              | Description / subtasks                                                                      | Acceptance criteria                        | Status |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------ | ------ |
| 0-1 | <span style="color: green">Init monorepo</span>    | pnpm init + workspaces root; add client, server, shared packages; Prettier + ESLint configs | `pnpm i && pnpm dev` spins Vite + nodemon. | ✅     |
| 0-2 | <span style="color: green">CI lint/test</span>     | GitHub Actions with Node 20; run `pnpm lint`, `pnpm test`                                   | PR fails on lint or failing Jest.          | ✅     |
| 0-3 | <span style="color: green">Pre-commit hooks</span> | Setup Husky + lint-staged for automatic Prettier formatting on commit                       | Files are auto-formatted before commit     | ✅     |

### 1 · Core database layer

| ID  | Title                                                 | Description                                                                                               | AC                                                  | Status |
| --- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------ |
| 1-1 | <span style="color: green">Choose ORM</span>          | Drizzle (lite) vs Prisma. Write decision doc.                                                             | Doc in `/docs` with pros/cons.                      | ✅     |
| 1-2 | <span style="color: green">Schema migration v0</span> | Implement tables from schema section (items, reviews, item_state, objective_state, cluster_state, users). | `pnpm server db:push` creates SQLite file.          | ✅     |
| 1-3 | <span style="color: green">Seed demo data</span>      | SQL seed for Chapter 1 Trees/Graphs: 8 clusters, ~20 objectives, 60 items (tier 1).                       | `SELECT count(*)` verifies counts.                  | ✅     |
| 1-4 | <span style="color: green">DB helper lib</span>       | In `/shared/db.ts` expose typed CRUD wrappers.                                                            | Unit tests return typed objects.                    | ✅     |
| 1-5 | Docker Postgres for prod                              | Compose file with postgres:15 + volume; server reads `DATABASE_URL`.                                      | `docker compose up` starts API & db without errors. |        |

### 2 · Backend foundational APIs

| ID  | Title                                                       | Description                                                                                  | AC                                         | Status |
| --- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------ | ------ |
| 2-1 | <span style="color: green">Express boilerplate</span>       | `server/src/index.ts`, env loader, health route.                                             | `GET /health` returns 200.                 | ✅     |
| 2-2 | <span style="color: green">Upload endpoint</span>           | `POST /api/upload` accepts raw text JSON and saves to `tmp/` as `.txt`, returns `upload_id`. | `curl` upload returns 201 + id.            | ✅     |
| 2-3 | <span style="color: green">Text chunker service</span>      | Split text into chunks ≤ **CHUNK_SIZE** (default 30k chars).                                 | Jest: sample text returns array of chunks. | ✅     |
| 2-4 | <span style="color: green">Objective extractor route</span> | `POST /api/objectives/extract` → DeepSeek call; returns JSON list.                           | For sample text returns ≥5 objectives.     | ✅     |
| 2-5 | CRUD objective/item                                         | REST routes `/objectives`, `/items` (GET/PUT/DELETE) for admin UI.                           | Swagger doc passes.                        | ✅     |
| 2-6 | <span style="color: green">Session "next" route</span>      | `/api/session/next` → scheduler pick logic.                                                  | Unit test returns item with correct tier.  | ✅     |
| 2-7 | Answer grading route                                        | `/api/session/:itemId/answer` posts user text → ensemble DeepSeek grader, writes reviews.    | Correct answer returns verdict correct.    |        |

### 3 · Scheduler engine

| ID  | Title                                                    | Description                                                            | AC                                                 |
| --- | -------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- | --- |
| 3-1 | Port FSRS algorithm                                      | Copy TypeScript FSRS-2024 into `/shared/fsrs.ts`.                      | Jest reproduces known easing table.                |
| 3-2 | <span style="color: green">Candidate pool builder</span> | Function: `getDue()`, `getFirstUnseen()`, `getStretch()`.              | Jest: returns arrays per definition.               | ✅  |
| 3-3 | ε-greedy selector                                        | Implement 70/20/10 pick; deterministic seed for tests.                 | Coverage > 90 %.                                   | ✅  |
| 3-4 | Write item_state updater                                 | After each review adjust `ease`, `next_due`, `p_recall`.               | Values match FSRS reference CSV.                   |
| 3-5 | Scheduler route integration                              | Wire `/session/next` to selector; middleware ensures cluster unlocked. | End-to-end test: 3 requests cycle due→new→stretch. |
| 3-6 | Unit tests & load test                                   | 1 000 simulated reviews keep avg response < 50 ms.                     | npm script `pnpm test:scheduler` passes.           |

### 4 · Gatekeeper service

| ID  | Title                      | Description                                                         | AC                              |
| --- | -------------------------- | ------------------------------------------------------------------- | ------------------------------- | --- |
| 4-1 | DAG util                   | Store dependency DAG JSON; function `canUnlock(userId, clusterId)`. | Jest graph traversal correct.   | ✅  |
| 4-2 | Mastery calculator         | Compute `p_mastery` per objective from reviews table.               | Matches manual calc ±0.01.      |
| 4-3 | Gatekeeper cron            | Node-cron every 30 s: update objective_state & cluster_state.       | Logs unlock events.             |
| 4-4 | Unlock notification socket | Emit `clusterUnlocked` over WebSocket (socket.io).                  | Frontend toast appears in dev.  |
| 4-5 | Admin dashboard route      | `/api/admin/progress/:userId` returns mastery JSON.                 | Returns correct mastered flags. |

### 5 · LLM Integration

| ID  | Title                                                      | Description                                                                 | AC                                                 | Status |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| 5-1 | <span style="color: green">DeepSeek client util</span>     | Axios wrapper with retries, timeout, rate-limit (token bucket).             | Jest mocks retry logic.                            | ✅     |
| 5-2 | <span style="color: green">Ensemble grader</span>          | `gradeFreeResponse(prompt, answer)` fan-outs 3 calls; majority vote.        | Sim test outputs consistent verdicts.              | ✅     |
| 5-3 | <span style="color: green">Objective extract prompt</span> | System + user template; parse JSON response.                                | Returns valid JSON list.                           | ✅     |
| 5-4 | <span style="color: green">Item generator prompt</span>    | Template supports tier, Bloom verb, avoids duplicates.                      | Generates ≥3 tiers for sample objective.           | ✅     |
| 5-5 | Cost logging middleware                                    | Write per-call token counts to `llm_usage` table.                           | Sum of tokens matches DeepSeek metadata.           |        |
| 5-6 | <span style="color: green">Improved grader feedback</span> | Enhanced prompts for contextual feedback instead of redundant confirmations | Correct answers get encouragement, not restatement | ✅     |

### 6 · Front-end: learner flow

| ID  | Title                                                  | Description                                                                              | AC                                      |
| --- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------- | --- |
| 6-1 | <span style="color: green">Auth stub</span>            | Anonymous UUID in `localStorage`; attach header `X-User`.                                | Requests include header.                | ✅  |
| 6-2 | <span style="color: green">Upload wizard UI</span>     | Step 1 file drop; Step 2 objective list editable; Step 3 confirm.                        | Saving creates course record.           | ✅  |
| 6-3 | <span style="color: green">Practice view</span>        | Card with stem, textarea, submit, feedback toast.                                        | Autoloads next item on verdict.         | ✅  |
| 6-4 | Progress dashboard                                     | Rings per cluster, chapter bar, streak counter.                                          | Renders from `/progress` JSON.          |
| 6-5 | Toast + unlock animation                               | On `clusterUnlocked` socket event show celebration.                                      | Works in dev over hot reload.           |
| 6-6 | Settings panel                                         | Toggle dark mode, choose review batch size.                                              | Pref saved to `localStorage`.           |
| 6-7 | Admin item viewer                                      | Table of items with search, tier filter, delete.                                         | Acts via CRUD routes.                   |
| 6-8 | Mobile responsive                                      | Tailwind breakpoints for card & dashboard.                                               | Chrome devtools iPhone12 passes.        |
| 6-9 | <span style="color: green">Enhanced feedback UI</span> | Separate verdict/feedback display, support for partial verdicts, better visual hierarchy | All verdict types have distinct styling | ✅  |

### 7 · Front-end: teacher / analytics (stretch)

| ID  | Title                        | Description                                      | AC                                |
| --- | ---------------------------- | ------------------------------------------------ | --------------------------------- |
| 7-1 | Heat-map of mastery          | D3 or Chart.js showing objective vs time matrix. | Hover shows `P_mastery` value.    |
| 7-2 | CSV export of reviews        | Button downloads `reviews.csv` for instructor.   | File matches db rows.             |
| 7-3 | Objectives editor drag-merge | UI to merge/split objectives visually.           | Two objectives merge into one id. |

### 8 · Dev-ops & QA

| ID  | Title                    | Description                                                | AC                                       |
| --- | ------------------------ | ---------------------------------------------------------- | ---------------------------------------- |
| 8-1 | VSCode dev-container     | Dockerfile + `.devcontainer.json` with Node, pnpm, sqlite. | Remote-Containers: Open boots workspace. |
| 8-2 | Seed script for CI       | Generate mock users & 500 reviews.                         | `pnpm seed` completes < 5s.              |
| 8-3 | Load-test script k6      | Simulate 20 concurrent users, 20 Q each.                   | 95th‑pct latency < 200 ms.               |
| 8-4 | Error logging middleware | Winston logger; unhandled errors to `logs/error.log`.      | Error triggers file write.               |
| 8-5 | Env schema validation    | Zod-based `validateEnv()` on server start.                 | Missing key exits with code 1.           |
| 8-6 | README quick-start       | Copy‑paste commands for Mac/Linux/Win.                     | New clone gets app in < 3 min.           |

## Roadmap / Sprint Plan

The following is the suggested sprint order (≈2 weeks each):

1. **Sprint 1 (weeks 1‑2)** – Tickets: 0‑1 → 0‑2, 1‑1 → 1‑3, 2‑1, 5‑1. Result: local text extractor & seed demo visible in DB.
2. **Sprint 2 (weeks 3‑4)** – Tickets: 2‑2 → 2‑5, 5‑2 → 5‑4, 6‑1 → 6‑3. Result: user can practice tier‑1 items end‑to‑end.
3. **Sprint 3 (weeks 5‑6)** – Scheduler 3‑1 → 3‑4, Gatekeeper 4‑1 → 4‑3, dashboard 6‑4. Result: adaptive loop works.
4. **Sprint 4 (weeks 7‑8)** – Mobile polish 6‑5 → 6‑6, LLM cost log 5‑5, CI & load test 8‑2 → 8‑3.
5. **Sprint 5 (weeks 9‑10)** – Docker Postgres 1‑5, dev‑container 8‑1, teacher analytics stretch if time.

Overall this schedule totals about 10 weeks solo or around 5‑6 weeks with two developers.
