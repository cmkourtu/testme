import { user, db } from '../db';
import { execSync } from 'child_process';

beforeAll(() => {
  execSync('pnpm --filter server exec prisma db push --skip-generate', {
    stdio: 'inherit',
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
