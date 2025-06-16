/** @jest-environment jsdom */
import { fetchNextItem } from '../src/api';
import { initAnonUser } from '../src/auth';

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(globalThis, 'fetch', {
    writable: true,
    configurable: true,
    value: jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ item: { id: 1 }, meta: { pool: 'due', p_recall: 0.9 } }),
      }),
    ),
  });
});

test('fetchNextItem calls API and returns result', async () => {
  initAnonUser();
  const data = await fetchNextItem();
  const call = (global.fetch as jest.Mock).mock.calls[0];
  expect(call[0]).toBe('/api/session/next');
  expect(data.item.id).toBe(1);
  expect(data.meta.pool).toBe('due');
});
