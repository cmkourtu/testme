jest.mock('../src/scheduler', () => {
  const actual = jest.requireActual('../src/scheduler');
  return {
    ...actual,
    getDue: jest.fn(),
    getFirstUnseen: jest.fn(),
    getStretch: jest.fn(),
  };
});

import {
  selectNextItem,
  getDue,
  getFirstUnseen,
  getStretch,
  _resetRngCacheForTests,
} from '../src/scheduler';

const mockDue = getDue as jest.MockedFunction<typeof getDue>;
const mockNew = getFirstUnseen as jest.MockedFunction<typeof getFirstUnseen>;
const mockStretch = getStretch as jest.MockedFunction<typeof getStretch>;

beforeEach(() => {
  mockDue.mockReset();
  mockNew.mockReset();
  mockStretch.mockReset();
  _resetRngCacheForTests();
});

test('selectNextItem respects epsilon weights', async () => {
  mockDue.mockResolvedValue([1]);
  mockNew.mockResolvedValue([2]);
  mockStretch.mockResolvedValue([3]);
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
