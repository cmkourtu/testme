import { selectNextItem, _resetRngCacheForTests } from '../src/scheduler';

// Mock the database
jest.mock('../../shared/db', () => ({
  db: {
    itemState: {
      findMany: jest.fn(),
    },
    item: {
      groupBy: jest.fn(),
    },
  },
}));

import { db } from '../../shared/db';

const mockItemState = db.itemState as jest.Mocked<typeof db.itemState>;
const mockItem = db.item as jest.Mocked<typeof db.item>;

beforeEach(() => {
  jest.clearAllMocks();
  _resetRngCacheForTests();
});

test('selectNextItem respects epsilon weights', async () => {
  // Mock getDue to return [1]
  mockItemState.findMany.mockImplementation(async (args: any) => {
    if (args.where.nextDue) {
      return [{ itemId: 1 }];
    }
    // For getStretch
    return [{ itemId: 3 }];
  });

  // Mock getFirstUnseen to return [2]
  mockItem.groupBy.mockResolvedValue([{ _min: { id: 2 } }] as any);

  const counts = { due: 0, new: 0, stretch: 0 } as Record<string, number>;
  for (let i = 0; i < 1000; i++) {
    const { pool } = await selectNextItem(42);
    counts[pool]++;
  }
  expect(counts.due).toBeGreaterThanOrEqual(670);
  expect(counts.due).toBeLessThanOrEqual(730);
  expect(counts.new).toBeGreaterThanOrEqual(170);
  expect(counts.new).toBeLessThanOrEqual(230);
  expect(counts.stretch).toBeGreaterThanOrEqual(70);
  expect(counts.stretch).toBeLessThanOrEqual(130);
});
