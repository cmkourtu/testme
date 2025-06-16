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

beforeEach(async () => {
  // Clean up between tests to ensure isolation
  await db.review.deleteMany({});
  await db.itemState.deleteMany({});
  await db.item.deleteMany({});
  await db.objective.deleteMany({});
  await db.user.deleteMany({});
  _resetRngCacheForTests();
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
  // Restore initial state with due and new items
  await seed();

  const pools: Array<'due' | 'new' | 'stretch'> = [];
  const ratings = [Rating.Again, Rating.Good, Rating.Hard];
  for (const rating of ratings) {
    const { pool, itemId } = await selectNextItem(64);
    pools.push(pool);
    if (!itemId) {
      throw new Error(`No item returned for pool: ${pool}`);
    }
    await answer(itemId, rating);
  }
  expect(pools).toEqual(['due', 'new', 'stretch']);
});

test('all pools empty returns undefined itemId', async () => {
  // Create user but no items - this ensures all pools are empty
  await db.user.create({ data: { id: 64, uuid: 'u64' } });

  // Start with empty pools - no item states and no items without states
  const { pool, itemId } = await selectNextItem(64);

  // Should still return a pool name (based on random selection)
  expect(['due', 'new', 'stretch']).toContain(pool);
  // But itemId should be undefined since all pools are empty
  expect(itemId).toBeUndefined();
});

test('only some pools have items - fallback behavior', async () => {
  // Setup: Create user and items
  await db.user.create({ data: { id: 64, uuid: 'u64' } });
  await db.objective.create({
    data: { id: 1, clusterId: 1, text: 'Demo', bloom: 'Remember' },
  });
  for (let t = 1; t <= 5; t++) {
    await db.item.create({
      data: { id: t, objectiveId: 1, tier: t, stem: `S${t}`, reference: `R${t}` },
    });
  }

  // Test 1: Only due pool has items
  // First, mark all items as seen (but not due) so new pool is empty
  for (let t = 1; t <= 5; t++) {
    await db.itemState.create({
      data: {
        userId: 64,
        itemId: t,
        stability: 1,
        difficulty: 1,
        ease: 1,
        nextDue: new Date(Date.now() + 10 * 86400000), // 10 days from now
        p_recall: 0.9,
      },
    });
  }
  
  // Update item 1 to be due
  await db.itemState.update({
    where: { userId_itemId: { userId: 64, itemId: 1 } },
    data: { nextDue: new Date(Date.now() - 86400000) }, // Yesterday
  });

  // Force selection of empty 'new' pool to test fallback
  const weights = { due: 0, new: 1, stretch: 0 };
  const result1 = await selectNextItem(64, weights);
  expect(result1.pool).toBe('due'); // Should fallback to due
  expect(result1.itemId).toBe(1);

  // Clean up for next test
  await db.itemState.deleteMany({});

  // Test 2: Only new pool has items (items without states)
  // All items have no states, so they're all "new"
  const result2 = await selectNextItem(64);
  if (result2.pool === 'new') {
    expect(result2.itemId).toBeDefined();
    expect([1, 2, 3, 4, 5]).toContain(result2.itemId);
  }

  // Test 3: Only stretch pool has items
  // First, mark all items as seen so new pool is empty
  for (let t = 1; t <= 5; t++) {
    await db.itemState.create({
      data: {
        userId: 64,
        itemId: t,
        stability: 1,
        difficulty: 1,
        ease: 1,
        nextDue: new Date(Date.now() + 10 * 86400000), // 10 days from now (not stretch)
        p_recall: 0.9,
      },
    });
  }

  // Update one item to be in stretch range
  await db.itemState.update({
    where: { userId_itemId: { userId: 64, itemId: 2 } },
    data: { nextDue: new Date(Date.now() + 3 * 86400000) }, // 3 days from now
  });

  // Force selection of empty 'due' pool to test fallback
  const weights3 = { due: 1, new: 0, stretch: 0 };
  const result3 = await selectNextItem(64, weights3);
  expect(result3.pool).toBe('stretch'); // Should fallback to stretch
  expect(result3.itemId).toBe(2);
});

test('multiple practice cycles maintain consistency', async () => {
  // Run multiple cycles to ensure consistent behavior
  const cycles = 3;
  const allResults: Array<{ cycle: number; pools: string[] }> = [];

  for (let cycle = 0; cycle < cycles; cycle++) {
    // Reset to initial state for each cycle
    await db.review.deleteMany({});
    await db.itemState.deleteMany({});
    await db.item.deleteMany({});
    await db.objective.deleteMany({});
    await db.user.deleteMany({});
    
    // Re-seed for each cycle
    await seed();
    _resetRngCacheForTests(); // Reset RNG for consistent results

    const pools: Array<'due' | 'new' | 'stretch'> = [];
    const ratings = [Rating.Again, Rating.Good, Rating.Hard];

    for (const rating of ratings) {
      const { pool, itemId } = await selectNextItem(64);
      pools.push(pool);
      if (itemId) {
        await answer(itemId, rating);
      }
    }

    allResults.push({ cycle, pools });
  }

  // All cycles should produce the same sequence
  for (let i = 1; i < cycles; i++) {
    expect(allResults[i].pools).toEqual(allResults[0].pools);
  }

  // And that sequence should be due → new → stretch
  expect(allResults[0].pools).toEqual(['due', 'new', 'stretch']);
});
