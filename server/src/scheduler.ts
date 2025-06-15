/**
 * Scheduler candidate pool helpers.
 * These queries run per user request and return item IDs
 * for the due, new and stretch pools.
 */
import { db } from '../../shared/db';

/**
 * Items whose next due date is now or in the past.
 */
export async function getDue(userId: number): Promise<number[]> {
  const now = new Date();
  const items = await db.itemState.findMany({
    where: { userId, nextDue: { lte: now } },
    select: { itemId: true },
  });
  return items.map((i) => i.itemId);
}

/**
 * Earliest unseen item per objective.
 */
export async function getFirstUnseen(userId: number): Promise<number[]> {
  const groups = await db.item.groupBy({
    by: ['objectiveId'],
    where: { states: { none: { userId } } },
    _min: { id: true },
    orderBy: { objectiveId: 'asc' },
  });
  return groups.map((g) => g._min.id!);
}

/**
 * Random items due in the next 1-7 days.
 */
export async function getStretch(userId: number): Promise<number[]> {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date();
  end.setDate(end.getDate() + 7);
  const items = await db.itemState.findMany({
    where: {
      userId,
      nextDue: { gte: start, lte: end },
    },
    select: { itemId: true },
  });
  const ids = items.map((i) => i.itemId);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}
