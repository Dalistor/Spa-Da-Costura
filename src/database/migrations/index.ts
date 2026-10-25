import type { Migration } from '../migrate';
import { initialSchema } from './001_initial_schema';
import { measurementKeyIgnoresCase } from './002_measurement_key_ignores_case';

/** Ordered schema history. Append new migrations; never edit a shipped one. */
export const MIGRATIONS: readonly Migration[] = [
  initialSchema,
  measurementKeyIgnoresCase,
];
