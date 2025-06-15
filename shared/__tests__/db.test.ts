/* eslint-disable @typescript-eslint/no-require-imports */
import { execSync } from 'child_process';
process.env.DATABASE_URL = 'file:./dev.db';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { user, db } = require('../db');

beforeAll(() => {
  execSync('pnpm --filter server exec prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./dev.db' },
  });
});

afterAll(async () => {
  await db.$disconnect();
});

test('create and fetch typed user', async () => {
  const u = await user.create({ data: { uuid: 'test-uuid' } });
  const fetched = await user.find({ id: u.id });
  expect(fetched?.uuid).toBe('test-uuid');
  await user.remove({ id: u.id });
});
