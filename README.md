# Cursor Learning

![coverage](.github/badges/coverage.svg)

Cursor Learning is an adaptive tutoring platform built as a pnpm workspace monorepo.
It contains a React client, an Express API, and shared TypeScript utilities.

## Packages

- **`/client`** – Vite powered React front‑end.
- **`/server`** – Express API with Prisma and LLM helpers.
- **`/shared`** – Reusable TypeScript utilities (e.g. FSRS scheduler).

Node 20 and pnpm 9 are required. Install dependencies at the repo root:

```bash
pnpm install
```

## Development

- **Start servers** – `pnpm dev` (runs client and server concurrently).
- **Lint** – `pnpm lint`
- **Test** – `pnpm test`
- **Seed database** – `pnpm seed`

Always run lint and tests before committing. The seed command pushes the Prisma
schema and populates demo data in `server/prisma/seed.ts`.

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

An example environment file lives at `.env.example` and currently expects a
`DEEPSEEK_API_KEY` for the LLM client.

## Directory Structure

```
/client   - React front-end
/server   - Express API and Prisma schema
/shared   - Common TypeScript helpers
/docs     - ADRs and technical documentation
```

## Running in Development

```bash
pnpm dev      # start client and server
pnpm lint     # run ESLint
pnpm test     # execute unit tests
pnpm seed     # push schema and seed demo data
```

The API serves a simple health check at `/health` returning a message from the
shared package.

---

Contributions should follow the coding guidelines in `AGENT.md`, keeping
Scheduler and Gatekeeper logic separate and providing tests for new helpers.
