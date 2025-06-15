/* eslint-disable @typescript-eslint/no-require-imports */
import { execSync } from 'child_process';
process.env.DATABASE_URL = 'file:./dev.db';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  db,
  user,
  item,
  review,
  itemState,
  objectiveState,
  clusterState,
  objective,
} = require('../db');

beforeAll(() => {
  execSync('pnpm --filter server exec prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./dev.db' },
  });
});

afterAll(async () => {
  await db.$disconnect();
});

test('exercise all db helpers', async () => {
  const u = await user.create({ data: { uuid: 'u1' } });
  await user.update({ where: { id: u.id }, data: { uuid: 'u2' } });
  const uFound = await user.find({ id: u.id });
  expect(uFound?.uuid).toBe('u2');

  const obj = await objective.create({
    data: { clusterId: 1, text: 't', bloom: 'Remember' },
  });
  await objective.update({ where: { id: obj.id }, data: { text: 't2' } });
  const objFound = await objective.find({ id: obj.id });
  expect(objFound?.text).toBe('t2');

  const itm = await item.create({
    data: { objectiveId: obj.id, tier: 1, stem: 's', reference: 'r' },
  });
  await item.update({ where: { id: itm.id }, data: { tier: 2 } });
  const itmFound = await item.find({ id: itm.id });
  expect(itmFound?.tier).toBe(2);

  const rev = await review.create({
    data: { userId: u.id, itemId: itm.id, verdict: 'correct', score: 1 },
  });
  await review.update({ where: { id: rev.id }, data: { score: 0.5 } });
  const revFound = await review.find({ id: rev.id });
  expect(revFound?.score).toBe(0.5);

  const is = await itemState.create({
    data: {
      userId: u.id,
      itemId: itm.id,
      stability: 1,
      difficulty: 1,
      ease: 1,
      nextDue: new Date(),
      p_recall: 0.5,
    },
  });
  await itemState.update({ where: { id: is.id }, data: { p_recall: 0.8 } });
  const isFound = await itemState.find({ id: is.id });
  expect(isFound?.p_recall).toBe(0.8);

  const os = await objectiveState.create({
    data: { userId: u.id, objectiveId: obj.id, p_mastery: 0.1 },
  });
  await objectiveState.update({ where: { id: os.id }, data: { p_mastery: 0.2 } });
  const osFound = await objectiveState.find({ id: os.id });
  expect(osFound?.p_mastery).toBe(0.2);

  const cs = await clusterState.create({ data: { userId: u.id, clusterId: 1 } });
  await clusterState.update({ where: { id: cs.id }, data: { unlocked: true } });
  const csFound = await clusterState.find({ id: cs.id });
  expect(csFound?.unlocked).toBe(true);

  await clusterState.remove({ id: cs.id });
  await objectiveState.remove({ id: os.id });
  await itemState.remove({ id: is.id });
  await review.remove({ id: rev.id });
  await item.remove({ id: itm.id });
  await objective.remove({ id: obj.id });
  await user.remove({ id: u.id });
});
