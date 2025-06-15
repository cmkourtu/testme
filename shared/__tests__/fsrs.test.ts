import { createScheduler, newCard, Rating } from '../fsrs';

const start1 = new Date('2024-01-01T00:00:00Z');
const seq1 = [
  Rating.Good,
  Rating.Good,
  Rating.Good,
  Rating.Good,
  Rating.Good,
  Rating.Good,
  Rating.Again,
  Rating.Again,
  Rating.Good,
  Rating.Good,
  Rating.Good,
  Rating.Good,
  Rating.Good,
];

const w = [
  0.4197, 1.1869, 3.0412, 15.2441, 7.1434, 0.6477, 1.0007, 0.0674, 1.6597, 0.1712, 1.1178,
  2.0225, 0.0904, 0.3025, 2.1214, 0.2498, 2.9466, 0.4891, 0.6468,
];
const start2 = new Date('2022-12-29T12:30:00Z');
const seq2 = [
  Rating.Again,
  Rating.Hard,
  Rating.Good,
  Rating.Easy,
  Rating.Again,
  Rating.Hard,
  Rating.Good,
  Rating.Easy,
];
const seq3 = [
  Rating.Hard,
  Rating.Good,
  Rating.Easy,
  Rating.Again,
  Rating.Hard,
  Rating.Good,
  Rating.Easy,
  Rating.Again,
];

const expected = [
  600000, 346200000, 1555800000, 5443800000, 17107800000, 49248600000, 49249200000,
  49249800000, 49422600000, 49854600000, 50718600000, 52446600000, 55902600000, 86400000,
  259200000, 777600000, 4320000000, 4665600000, 5270400000, 7084800000, 18576000000,
  172800000, 777600000, 5443200000, 5875200000,
];

function run(
  ratings: Rating[],
  start: Date,
  params?: Partial<import('../fsrs').FSRSParameters>,
) {
  const scheduler = createScheduler(params);
  let card = newCard(start);
  let now = start;
  const result: number[] = [];
  for (const r of ratings) {
    const preview = scheduler.repeat(card, now) as unknown as Record<
      Rating,
      import('../fsrs').RecordLogItem
    >;
    const rec = preview[r];
    result.push(rec.card.due.getTime() - start.getTime());
    card = rec.card;
    now = card.due;
  }
  return result;
}

describe('fsrs fixtures', () => {
  it('matches expected intervals', () => {
    const intervals: number[] = [];
    intervals.push(...run(seq1, start1));
    intervals.push(...run(seq2, start2, { w, enable_short_term: false }));
    intervals.push(...run(seq3, start2, { w, enable_short_term: false }).slice(0, 4));
    expect(intervals).toHaveLength(expected.length);
    intervals.forEach((ivl, i) => {
      expect(Math.abs(ivl - expected[i])).toBeLessThanOrEqual(1);
    });
  });
});
