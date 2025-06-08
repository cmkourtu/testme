/** @jest-environment jsdom */
import { generatePracticeItem, gradePracticeAnswer } from '../src/api';
import { initAnonUser } from '../src/auth';

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(globalThis, 'fetch', {
    writable: true,
    configurable: true,
    value: jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) })),
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
