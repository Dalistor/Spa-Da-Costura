import type { Database } from './Database';

export type Migration = {
  /** Schema version reached after this migration; must follow 1, 2, 3... */
  version: number;
  statements: readonly string[];
};

/**
 * Brings the schema to the latest version, one transaction per migration.
 * The version lives in `PRAGMA user_version`, which SQLite updates inside the
 * same transaction, so a failed migration leaves data and version untouched.
 */
export async function migrate(
  db: Database,
  migrations: readonly Migration[],
): Promise<void> {
  assertSequential(migrations);
  const current = await readSchemaVersion(db);
  const latest = migrations.length;
  if (current > latest) {
    throw new Error(
      `Database schema version ${current} is newer than this app supports (${latest})`,
    );
  }

  for (const migration of migrations.slice(current)) {
    await db.transaction(async tx => {
      for (const statement of migration.statements) {
        await tx.execute(statement);
      }
      await tx.execute(`PRAGMA user_version = ${migration.version}`);
    });
  }
}

async function readSchemaVersion(db: Database): Promise<number> {
  const [row] = await db.query('PRAGMA user_version');
  return Number(row?.user_version ?? 0);
}

function assertSequential(migrations: readonly Migration[]): void {
  migrations.forEach((migration, index) => {
    if (migration.version !== index + 1) {
      throw new Error(
        `Migration versions must be sequential from 1; found ${
          migration.version
        } at position ${index + 1}`,
      );
    }
  });
}
