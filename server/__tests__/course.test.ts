import request from 'supertest';
import { app } from '../src/index';
import { course } from '../../shared/db';

jest.mock('../../shared/db', () => ({
  course: { create: jest.fn() },
}));

test('POST /api/courses creates course', async () => {
  (course.create as jest.Mock).mockResolvedValue({ id: 1, title: 'Demo', uploadId: 'u1' });
  const res = await request(app)
    .post('/api/courses')
    .send({ title: 'Demo', uploadId: 'u1' });
  expect(res.status).toBe(201);
  expect(course.create).toHaveBeenCalledWith({ data: { title: 'Demo', uploadId: 'u1' } });
  expect(res.body.id).toBe(1);
});

test('POST /api/courses validates input', async () => {
  const res = await request(app).post('/api/courses').send({});
  expect(res.status).toBe(400);
});
