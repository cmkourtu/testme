import request from 'supertest';
import { app } from '../src/index';
import { selectNextItem } from '../src/scheduler';
import { db } from '../../shared/db';

jest.mock('../src/scheduler', () => ({ selectNextItem: jest.fn() }));
jest.mock('../../shared/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    item: {
      findUnique: jest.fn(),
    },
    itemState: {
      findUnique: jest.fn(),
    },
  },
}));

const mockSelect = selectNextItem as jest.Mock;
const mockDb = db as unknown as {
  user: { findUnique: jest.Mock; create: jest.Mock };
  item: { findUnique: jest.Mock };
  itemState: { findUnique: jest.Mock };
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('GET /api/session/next returns item and meta', async () => {
  mockDb.user.findUnique.mockResolvedValue(null);
  mockDb.user.create.mockResolvedValue({ id: 1, uuid: 'u1' });
  mockSelect.mockResolvedValue({ pool: 'due', itemId: 5 });
  mockDb.item.findUnique.mockResolvedValue({ id: 5, stem: 'Q' });
  mockDb.itemState.findUnique.mockResolvedValue({ p_recall: 0.8 });

  const res = await request(app).get('/api/session/next').set('X-User', 'u1');
  expect(res.status).toBe(200);
  expect(res.body.item.id).toBe(5);
  expect(res.body.meta.pool).toBe('due');
  expect(res.body.meta.p_recall).toBe(0.8);
  expect(mockDb.user.create).toHaveBeenCalledWith({ data: { uuid: 'u1' } });
});

test('GET /api/session/next requires auth', async () => {
  const res = await request(app).get('/api/session/next');
  expect(res.status).toBe(401);
});
