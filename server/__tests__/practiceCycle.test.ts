/* eslint-disable @typescript-eslint/no-require-imports */
import { spawnSync } from 'child_process';
import { Rating } from '../../shared/fsrs';

const url = `file:memdb_${Date.now()}?mode=memory&cache=shared`;
const Prisma = require('@prisma/client') as typeof import('@prisma/client');
const { PrismaClient } = Prisma;
const memoryDb = new PrismaClient({ datasources: { db: { url } } });

jest.mock('../../shared/db', () => ({ db: memoryDb }));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { selectNextItem, _resetRngCacheForTests } = require('../src/scheduler');

let db: import('@prisma/client').PrismaClient;

beforeAll(async () => {
  db = memoryDb;
  await db.$connect();
  spawnSync(
    'pnpm',
    [
      '--filter',
      'server',
      'exec',
      'prisma',
      'db',
      'push',
      '--schema',
      'prisma/schema.prisma',
      '--skip-generate',
    ],
    { env: { ...process.env, DATABASE_URL: url }, stdio: 'inherit' },
  );
  await seed();
});

afterAll(async () => {
  await db.$disconnect();
});

async function seed() {
  await db.user.create({ data: { id: 64, uuid: 'u64' } });
  await db.objective.create({
    data: { id: 1, clusterId: 1, text: 'Demo', bloom: 'Remember' },
  });
  for (let t = 1; t <= 5; t++) {
    await db.item.create({
      data: { id: t, objectiveId: 1, tier: t, stem: `S${t}`, reference: `R${t}` },
    });
  }
  const now = new Date();
  await db.itemState.create({
    data: {
      id: 1,
      userId: 64,
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
      id: 2,
      userId: 64,
      itemId: 3,
      stability: 1,
      difficulty: 1,
      ease: 1,
      nextDue: new Date(now.getTime() + 3 * 86400000),
      p_recall: 0.9,
    },
  });
}
const offsets: Record<Rating, number> = {
  [Rating.Again]: 0,
  [Rating.Manual]: 0,
  [Rating.Hard]: 1,
  [Rating.Good]: 3,
  [Rating.Easy]: 7,
};

async function answer(itemId: number, rating: Rating): Promise<void> {
  const now = new Date();
  const nextDue = new Date(now.getTime() + offsets[rating] * 86400000);
  const existing = await db.itemState.findUnique({
    where: { userId_itemId: { userId: 64, itemId } },
  });
  if (existing) {
    await db.itemState.update({
      where: { id: existing.id },
      data: { nextDue, lastReview: now },
    });
  } else {
    await db.itemState.create({
      data: {
        userId: 64,
        itemId,
        stability: 1,
        difficulty: 1,
        ease: 1,
        nextDue,
        lastReview: now,
        p_recall: 0.9,
      },
    });
  }
  await db.review.create({
    data: { userId: 64, itemId, verdict: Rating[rating].toLowerCase(), score: 1 },
  });
}

test('practice cycle returns due → new → stretch', async () => {
  _resetRngCacheForTests();
  const pools: Array<'due' | 'new' | 'stretch'> = [];
  const ratings = [Rating.Again, Rating.Good, Rating.Hard];
  for (const rating of ratings) {
    const { pool, itemId } = await selectNextItem(64);
    pools.push(pool);
    if (itemId) await answer(itemId, rating);
  }
  expect(pools).toEqual(['due', 'new', 'stretch']);
});
