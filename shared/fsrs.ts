import {
  fsrs as createFSRS,
  createEmptyCard,
  Rating,
  State,
  type Grade,
  type Card,
  type FSRSParameters,
  type RecordLog,
  type RecordLogItem,
} from 'ts-fsrs';

export { Rating, State };
export type { Grade, Card, FSRSParameters, RecordLog, RecordLogItem };

/**
 * Create a scheduler using the default 2024 FSRS parameters.
 */
export function createScheduler(params?: Partial<FSRSParameters>) {
  return createFSRS(params);
}

/**
 * Helper to create an empty card at a given time.
 */
export function newCard(now: Date = new Date()) {
  return createEmptyCard(now);
}
