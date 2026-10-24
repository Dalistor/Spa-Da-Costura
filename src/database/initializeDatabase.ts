import type { Database } from './Database';
import { migrate, type Migration } from './migrate';
import { MIGRATIONS } from './migrations';

/** Prepares a freshly opened connection: enforces relations, then migrates. */
export async function initializeDatabase(
  db: Database,
  migrations: readonly Migration[] = MIGRATIONS,
): Promise<void> {
  await db.execute('PRAGMA foreign_keys = ON');
  await migrate(db, migrations);
}
