import { splitIntoChunks } from '../src/chunker';

test('splits text into fixed-size chunks', () => {
  const chunks = splitIntoChunks('a'.repeat(25), 10);
  expect(chunks).toEqual(['a'.repeat(10), 'a'.repeat(10), 'a'.repeat(5)]);
});


test('returns empty array for empty text', () => {
  expect(splitIntoChunks('', 5)).toEqual([]);
});

test('uses default size when not provided', () => {
  const sample = 'abc';
  expect(splitIntoChunks(sample)).toEqual([sample]);
});
