import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Used by the upload endpoint to persist raw text for later processing.
// Text is saved under ../tmp/<id>.txt and referenced by id.
export const UPLOAD_DIR = path.join(__dirname, '../tmp');

export async function saveText(text: string): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const id = crypto.randomUUID();
  await fs.writeFile(path.join(UPLOAD_DIR, `${id}.txt`), text);
  return id;
}
