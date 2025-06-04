import request from 'supertest';
import { app } from '../src/index';
import { db } from '../../shared/db';

jest.mock('../../shared/db', () => ({
  db: {
    objective: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    item: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}));


test('GET /api/objectives returns list', async () => {
  (db.objective.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
  const res = await request(app).get('/api/objectives');
  expect(res.status).toBe(200);
  expect(res.body.objectives).toHaveLength(1);
});

test('PUT /api/items/:id updates item', async () => {
  (db.item.update as jest.Mock).mockResolvedValue({ id: 2, stem: 'x' });
  const res = await request(app).put('/api/items/2').send({ stem: 'x' });
  expect(res.status).toBe(200);
  expect(res.body.stem).toBe('x');
});

test('DELETE /api/objectives/:id returns 204', async () => {
  (db.objective.delete as jest.Mock).mockResolvedValue({});
  const res = await request(app).delete('/api/objectives/1');
  expect(res.status).toBe(204);
});
