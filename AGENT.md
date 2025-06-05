# AGENT Instructions for Codex

## Repository Overview
- This is a **pnpm workspace** monorepo containing three packages:
  - `/client` – React front-end (Vite).
  - `/server` – Express API with Prisma and LLM utilities.
  - `/shared` – TypeScript utilities (e.g. FSRS algorithm).
- Node 20 and pnpm 9 are expected. Install deps with `pnpm install` at the repo root.

## Development Commands
- **Start dev servers**: `pnpm dev` (runs client and server concurrently).
- **Lint**: `pnpm lint`
- **Test**: `pnpm test`
- Always run lint and tests before committing. CI will run the same commands.
- The seed script is `pnpm seed` which creates demo data via Prisma.

## Architecture Summary
- The platform is an adaptive learning engine.
- **Scheduler** (inside `server`): decides which item a learner sees next. It computes recall probabilities with the FSRS algorithm and selects from due, new, or stretch pools using an ε‑greedy rule (70 % due, 20 % new, 10 % stretch by default).
- **Gatekeeper**: a periodic job that updates objective and cluster mastery. When all prerequisites for a cluster are mastered it becomes unlocked. Unlock events are sent to the front end via WebSocket.
- Both services read and write the same tables (`items`, `reviews`, `item_state`, `objective_state`, `cluster_state`). Scheduler runs synchronously per request; Gatekeeper runs every ~30 s.

## File Locations
- Database schema: `server/prisma/schema.prisma`.
- Seed data script: `server/prisma/seed.ts`.
- Express entry point: `server/src/index.ts`.
- LLM utilities (DeepSeek client, prompts, etc.) live in `server/src/llm`.
- Shared utilities: `shared/src`.

## Working Guidelines
1. Keep Scheduler and Gatekeeper logic separate. Scheduler should only answer "which item now" while Gatekeeper handles mastery/unlock decisions.
2. Use TypeScript across all packages. Check typings and run tests for any helper functions.
3. When adding LLM prompts or API calls, place reusable code under `server/src/llm` and include unit tests with mocks (nock).
4. For new database migrations, update `schema.prisma` and run `pnpm --filter server prisma db push`; include generated client in commits.
5. Any new script or route should include a brief description in comments explaining its role in the Scheduler/Gatekeeper workflow.
6. Commit messages should be concise ("feat: add objective extractor" or "fix: update lint config").
7. The backlog may be outdated. Do not assume it reflects the current state. After closing a ticket mentioned in `docs/backlog-roadmap.md`, update that file accordingly.

## Testing Checklist
Before opening a PR:
1. Run `pnpm lint` and ensure there are no warnings.
2. Run `pnpm test` and ensure all tests pass.
3. If database changes were made, run `pnpm seed` to verify migrations succeed.

Following these guidelines will keep the codebase consistent and ensure the adaptive tutor engine works as designed.
