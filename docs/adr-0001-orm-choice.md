# ADR-0001: ORM Choice

## Context
We need an ORM to access SQLite in development and Postgres in production.

## Options Considered
- Prisma
- Drizzle
- MikroORM
- Knex

## Evaluation Criteria
- Type-safety
- Migration tooling
- Learning curve
- Bundle size
- CI speed

## Decision Matrix

| Criterion       | Prisma | Drizzle | MikroORM | Knex |
|-----------------|:------:|:-------:|:--------:|:----:|
| Type-safety     | ✓      | ✓      | ✓       | ✗ |
| Migration tool  | ✓      | ✓      | ✓       | ✗ |
| Learning curve  | ✗      | ✓      | ✗       | ✓ |
| Bundle size     | ✗      | ✓      | ✗       | ✓ |
| CI speed        | ✗      | ✓      | ✗       | ✓ |

## Decision
We choose **Prisma** because it offers a rich feature set and strong type-safety with a mature migration system, which outweighs its larger bundle size and slower CI.

`npx prisma --version` shows ~100MB install, whereas `npm pack drizzle-orm` is just a few KB.

## Consequences
We must maintain Prisma schema files and run `prisma generate` in CI. Future migrations will rely on Prisma's tooling.
