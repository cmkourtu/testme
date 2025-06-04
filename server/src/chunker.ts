export const CHUNK_SIZE = 30000;

export function splitIntoChunks(text: string, size = CHUNK_SIZE): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}
