import {
  createEmptyCard,
  fsrs as createFSRS,
  generatorParameters,
  Rating,
  Grades,
  type FSRS,
  type FSRSParameters,
  type Grade,
  type Card,
  type CardInput,
  type FSRSState,
  type RecordLogItem,
} from 'ts-fsrs';

export type { FSRS, FSRSParameters, Grade, Card, CardInput, FSRSState, RecordLogItem };

export { createEmptyCard, Rating, Grades };

export const defaultParameters: FSRSParameters = generatorParameters();

export function fsrs(params: Partial<FSRSParameters> = {}): FSRS {
  return createFSRS({ ...defaultParameters, ...params });
}
