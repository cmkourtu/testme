import { fsrs, createEmptyCard, Rating, Grades, type Grade } from '../fsrs';

test('default params reproduce known intervals', () => {
  const scheduler = fsrs();
  let card = createEmptyCard(new Date(2022, 11, 29, 12, 30, 0, 0));
  let now = card.due;
  const ratings: Grade[] = [
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
  const expected = [0, 4, 14, 45, 135, 372, 0, 0, 2, 5, 10, 20, 40];
  const intervals: number[] = [];
  let sc = scheduler.repeat(card, now);
  for (const rating of ratings) {
    for (const grade of Grades) {
      const rb = scheduler.rollback(sc[grade].card, sc[grade].log);
      expect(rb).toEqual(card);
      expect(sc[grade]).toEqual(fsrs().next(card, now, grade));
    }
    card = sc[rating].card;
    intervals.push(card.scheduled_days);
    now = card.due;
    sc = scheduler.repeat(card, now);
  }
  expect(intervals).toEqual(expected);
});
