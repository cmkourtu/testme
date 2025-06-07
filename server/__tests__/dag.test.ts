import { canUnlock, setGraph } from '../src/dag';
import { db } from '../../shared/db';

jest.mock('../../shared/db', () => ({
  db: {
    clusterState: {
      findFirst: jest.fn()
    }
  }
}));

const findFirst = db.clusterState.findFirst as jest.Mock;

beforeEach(() => {
  findFirst.mockReset();
});

test('canUnlock returns true when prerequisites mastered', async () => {
  setGraph({ 1: [], 2: [1] });
  findFirst.mockResolvedValue({ mastered: true });
  const ok = await canUnlock(5, 2);
  expect(ok).toBe(true);
  expect(findFirst).toHaveBeenCalledWith({ where: { userId: 5, clusterId: 1 } });
});

test('canUnlock returns false when a prerequisite is unmastered', async () => {
  setGraph({ 1: [], 2: [1] });
  findFirst.mockImplementation(({ where }) => {
    if (where.clusterId === 1) return Promise.resolve({ mastered: false });
    return Promise.resolve({ mastered: true });
  });
  const ok = await canUnlock(5, 2);
  expect(ok).toBe(false);
});

