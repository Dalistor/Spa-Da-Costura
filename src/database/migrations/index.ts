import type { Migration } from '../migrate';
import { initialSchema } from './001_initial_schema';

/** Ordered schema history. Append new migrations; never edit a shipped one. */
export const MIGRATIONS: readonly Migration[] = [initialSchema];
