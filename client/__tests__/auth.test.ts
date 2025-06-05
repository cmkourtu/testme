/** @jest-environment jsdom */
import { initAnonUser } from '../src/auth';
import { apiFetch } from '../src/api';

describe('auth stub', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(globalThis, 'fetch', {
      writable: true,
      configurable: true,
      value: jest.fn(() => Promise.resolve({} as Response)),
    });
  });

  test('initAnonUser stores uuid', () => {
    const id = initAnonUser();
    expect(id).toBe(localStorage.getItem('anon_id'));
    expect(id).toMatch(/[0-9a-f-]{36}/);
  });

  test('apiFetch attaches X-User header', async () => {
    const id = initAnonUser();
    await apiFetch('/api/test');
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].headers['X-User']).toBe(id);
  });
});
