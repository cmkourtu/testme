import { splitIntoChunks } from '../src/chunker';

test('splits text into fixed-size chunks', () => {
  const chunks = splitIntoChunks('a'.repeat(25), 10);
  expect(chunks).toEqual(['a'.repeat(10), 'a'.repeat(10), 'a'.repeat(5)]);
});

