# Cursor Learning

[![Coverage](https://codecov.io/gh/cmkourtu/cursor-learning/branch/main/graph/badge.svg)](https://codecov.io/gh/cmkourtu/cursor-learning)

Cursor Learning is an adaptive tutoring platform built as a pnpm workspace monorepo.
It contains a React client, an Express API, and shared TypeScript utilities.

## Packages

- **`/client`** – Vite powered React front‑end.
- **`/server`** – Express API with Prisma and LLM helpers.
- **`/shared`** – Reusable TypeScript utilities (e.g. FSRS scheduler).

Node 20 and pnpm 9 are required. Install dependencies at the repo root:

Run `pnpm install` once after cloning to install workspace dependencies:

```bash
pnpm install
```

## Development

- **Start servers** – `pnpm dev` (seeds the database then runs client and server concurrently).
- **Lint** – `pnpm lint`
- **Test** – `pnpm test`
- **Seed database manually** – `pnpm seed`

`pnpm dev` automatically pushes the Prisma schema and seeds demo data before starting the servers. Always run lint and tests before committing.

## Architecture Overview

The platform is an adaptive learning engine consisting of two main services:

1. **Scheduler** – Computes recall probabilities with the FSRS algorithm and
   chooses the next item from due, new, or stretch pools using an ε‑greedy rule
   (70 % due, 20 % new, 10 % stretch by default).
2. **Gatekeeper** – Periodically updates objective and cluster mastery. When all
   prerequisites of a cluster are mastered it becomes unlocked and the event is
   sent to the front end via WebSocket.

Both services read and write to the same tables (`items`, `reviews`,
`item_state`, `objective_state`, `cluster_state`). Scheduler runs on each
request while Gatekeeper runs roughly every 30 seconds.

## Important Files

- **Database schema** – `server/prisma/schema.prisma`
- **Seed script** – `server/prisma/seed.ts`
- **Express entry** – `server/src/index.ts`
- **LLM utilities** – `server/src/llm`
- **Shared utilities** – `shared/src`

An example environment file lives at `.env.example` and includes a
`DEEPSEEK_API_KEY` for the LLM client. The API port can be configured via
`PORT` (defaults to `3000`).

## Directory Structure

```
/client   - React front-end
/server   - Express API and Prisma schema
/shared   - Common TypeScript helpers
/docs     - ADRs and technical documentation
```

## Running in Development

```bash
pnpm dev      # seed then start client and server
pnpm lint     # run ESLint
pnpm test     # execute unit tests

pnpm seed     # push schema and seed demo data
```

Once the dev servers are running, Vite serves the React client on
`http://localhost:5173`. Open this address in your browser to use the
Upload Wizard UI. The Express API listens on the `PORT` environment
variable (default `3000`).

The API serves a simple health check at `/health` returning a message from the
shared package.

## Current Features

- **Text Upload** – `POST /api/upload` saves raw text and returns an `upload_id`.
- **Objective Extraction** – `POST /api/objectives/extract` sends text to the
  DeepSeek LLM and returns a JSON list of objectives.
- **Course Creation** – `POST /api/courses` associates a title with an uploaded
  text file.
- **Admin CRUD** – `/api/objectives` and `/api/items` expose basic management
  routes.
- **Upload Wizard UI** – Front-end flow for file or text input, objective edit,
  and course save.
- **Practice View** – Simple learner interface that submits free responses and
  loads the next item.
---

Contributions should follow the coding guidelines in `AGENT.md`, keeping
Scheduler and Gatekeeper logic separate and providing tests for new helpers.
