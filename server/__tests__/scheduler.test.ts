/* eslint-disable @typescript-eslint/no-require-imports */
import { spawnSync } from 'child_process';

const url = `file:memdb_${Date.now()}?mode=memory&cache=shared`;
process.env.DATABASE_URL = url;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Prisma = require('@prisma/client') as typeof import('@prisma/client');
const { PrismaClient } = Prisma;
const memoryDb = new PrismaClient({ datasources: { db: { url } } });
jest.mock('../../shared/db', () => ({ db: memoryDb }));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDue, getFirstUnseen, getStretch } = require('../src/scheduler');
let db: import('@prisma/client').PrismaClient;

afterAll(async () => {
  if (db) await db.$disconnect();
});

beforeAll(async () => {
  db = memoryDb;
  await db.$connect();
  spawnSync(
    'server/node_modules/.bin/prisma',
    ['db', 'push', '--schema', 'server/prisma/schema.prisma', '--skip-generate'],
    {
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'inherit',
    },
  );
  await seed();
});

async function seed() {
  await db.user.create({ data: { uuid: 'u1' } });
  await db.objective.create({
    data: { id: 1, clusterId: 1, text: 'O1', bloom: 'Remember' },
  });
  await db.objective.create({
    data: { id: 2, clusterId: 1, text: 'O2', bloom: 'Remember' },
  });
  await db.item.create({
    data: { id: 1, objectiveId: 1, tier: 1, stem: 'S1', reference: 'R1' },
  });
  await db.item.create({
    data: { id: 2, objectiveId: 1, tier: 1, stem: 'S2', reference: 'R2' },
  });
  await db.item.create({
    data: { id: 3, objectiveId: 2, tier: 1, stem: 'S3', reference: 'R3' },
  });
  await db.item.create({
    data: { id: 4, objectiveId: 2, tier: 1, stem: 'S4', reference: 'R4' },
  });
  const now = new Date();
  await db.itemState.create({
    data: {
      id: 1,
      userId: 1,
      itemId: 1,
      stability: 1,
      difficulty: 1,
      ease: 1,
      nextDue: new Date(now.getTime() - 86400000),
      p_recall: 0.9,
    },
  });
  await db.itemState.create({
    data: {
      id: 3,
      userId: 1,
      itemId: 3,
      stability: 1,
      difficulty: 1,
      ease: 1,
      nextDue: new Date(now.getTime() + 4 * 86400000),
      p_recall: 0.9,
    },
  });
}

test('getDue returns past due items', async () => {
  const due = await getDue(1);
  expect(due).toEqual([1]);
});

test('getFirstUnseen returns earliest unseen per objective', async () => {
  const unseen = await getFirstUnseen(1);
  expect(unseen).toEqual([2, 4]);
});

test('getStretch returns future items between 1 and 7 days', async () => {
  const stretch = await getStretch(1);
  expect(stretch).toContain(3);
  expect(stretch.length).toBe(1);
});

test('nextDue index is used', async () => {
  const plan =
    (await db.$queryRaw`EXPLAIN QUERY PLAN SELECT itemId FROM ItemState WHERE nextDue <= '2100-01-01'`) as Array<{
      detail: string;
    }>;
  const used = plan.map((p) => p.detail).join(' ');
  expect(used).toMatch(/ItemState_nextDue_idx/);
});
