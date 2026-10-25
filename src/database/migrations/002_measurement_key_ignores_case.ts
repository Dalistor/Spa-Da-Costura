import type { Migration } from '../migrate';

// A measurement key is unique per customer regardless of letter case
// (clientes@2). Keys repeated before this rule are renamed, never deleted:
// every newer repetition gets its id appended so the seamstress can review it.
export const measurementKeyIgnoresCase: Migration = {
  version: 2,
  statements: [
    `UPDATE measurement
SET key = key || ' (' || id || ')'
WHERE EXISTS (
  SELECT 1 FROM measurement AS older
  WHERE older.customer_id = measurement.customer_id
    AND older.key = measurement.key COLLATE NOCASE
    AND older.id < measurement.id
)`,
    'CREATE UNIQUE INDEX measurement_customer_key_nocase ON measurement (customer_id, key COLLATE NOCASE)',
  ],
};
