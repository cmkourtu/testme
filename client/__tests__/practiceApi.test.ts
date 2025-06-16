/** @jest-environment jsdom */
import { generatePracticeItem, gradePracticeAnswer, fetchNextItem } from '../src/api';
import { initAnonUser } from '../src/auth';

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(globalThis, 'fetch', {
    writable: true,
    configurable: true,
    value: jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })),
  });
});

test('generatePracticeItem posts objective', async () => {
  initAnonUser();
  await generatePracticeItem('O', 1);
  const call = (global.fetch as jest.Mock).mock.calls[0];
  expect(call[0]).toBe('/api/practice/question');
  const opts = call[1];
  expect(opts.method).toBe('POST');
});

test('gradePracticeAnswer posts answer', async () => {
  initAnonUser();
  await gradePracticeAnswer('Q', 'A', 'B');
  const call = (global.fetch as jest.Mock).mock.calls[0];
  expect(call[0]).toBe('/api/practice/grade');
  const opts = call[1];
  expect(opts.method).toBe('POST');
});

test('fetchNextItem returns item', async () => {
  initAnonUser();
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      item: { id: 1, stem: 'Q' },
      meta: { pool: 'due', p_recall: 0.9 },
    }),
  });
  const data = await fetchNextItem();
  const call = (global.fetch as jest.Mock).mock.calls[0];
  expect(call[0]).toBe('/api/session/next');
  expect(data.item.id).toBe(1);
  expect(data.meta.pool).toBe('due');
});
