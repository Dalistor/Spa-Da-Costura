import type { BusinessMonth } from '../../calendar';
import type { SqlValue } from '../../database';

/** Bounds for `date BETWEEN ? AND ?`: "YYYY-MM-DD" text sorts like the dates. */
export function monthRange(month: BusinessMonth): [SqlValue, SqlValue] {
  return [`${month}-01`, `${month}-31`];
}
