import request from 'supertest';
import { app } from '../src/index';
import { db } from '../../shared/db';

jest.mock('../../shared/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockDb = db as unknown as {
  user: { findUnique: jest.Mock; create: jest.Mock };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Auth middleware', () => {
  test('accepts valid UUID v4 format', async () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    mockDb.user.findUnique.mockResolvedValue({ id: 1, uuid: validUuid });

    const res = await request(app).get('/api/session/next').set('X-User', validUuid);

    expect(res.status).not.toBe(400);
    expect(mockDb.user.findUnique).toHaveBeenCalledWith({ where: { uuid: validUuid } });
  });

  test('rejects invalid UUID formats', async () => {
    const invalidUuids = [
      'not-a-uuid',
      '123456789',
      'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      '550e8400-e29b-11d4-a716-446655440000', // wrong version (1 instead of 4)
      '550e8400-e29b-41d4-3716-446655440000', // wrong variant
      '550e8400e29b41d4a716446655440000', // no hyphens
      '550e8400-e29b-41d4-a716-44665544000', // too short
      '550e8400-e29b-41d4-a716-4466554400000', // too long
    ];

    for (const invalidUuid of invalidUuids) {
      const res = await request(app).get('/api/session/next').set('X-User', invalidUuid);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid_uuid_format');
    }
  });

  test('returns 401 when no UUID provided', async () => {
    const res = await request(app).get('/api/session/next');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  test('returns 401 for empty UUID', async () => {
    const res = await request(app).get('/api/session/next').set('X-User', '');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  test('returns 401 for whitespace-only UUID', async () => {
    const res = await request(app).get('/api/session/next').set('X-User', '   ');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  test('creates new user if not found', async () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    mockDb.user.findUnique.mockResolvedValue(null);
    mockDb.user.create.mockResolvedValue({ id: 1, uuid: validUuid });

    const res = await request(app).get('/api/session/next').set('X-User', validUuid);

    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(400);
    expect(mockDb.user.create).toHaveBeenCalledWith({ data: { uuid: validUuid } });
  });

  test('handles database errors gracefully', async () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    mockDb.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

    const res = await request(app).get('/api/session/next').set('X-User', validUuid);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('internal_server_error');
  });

  test('handles user creation errors gracefully', async () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    mockDb.user.findUnique.mockResolvedValue(null);
    mockDb.user.create.mockRejectedValue(new Error('Unique constraint violation'));

    const res = await request(app).get('/api/session/next').set('X-User', validUuid);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('internal_server_error');
  });
});
