import type { Database, SqlExecutor } from '../../database';
import {
  BACKUP_FORMAT,
  BACKUP_TABLES,
  parseBackup,
  type Backup,
  type BackupRow,
  type BackupTable,
  type ImportError,
} from '../domain';

export type ImportBackupResult =
  | { ok: true }
  | { ok: false; error: ImportError };

/** Every row of every table, deleted customers included, as backup file text. */
export async function exportBackup(db: Database): Promise<string> {
  const tables = {} as Record<BackupTable, BackupRow[]>;
  for (const table of BACKUP_TABLES) {
    tables[table] = await db.query(`SELECT * FROM ${table} ORDER BY id`);
  }
  const backup: Backup = {
    format: BACKUP_FORMAT,
    schemaVersion: await schemaVersionOf(db),
    createdAt: new Date().toISOString(),
    tables,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Replaces all data with the backup in one transaction, keeping ids and
 * timestamps. Any refused row (wrong columns, CHECK, orphan) rolls everything
 * back, so the current data stays.
 */
export async function importBackup(
  db: Database,
  text: string,
): Promise<ImportBackupResult> {
  const parsed = parseBackup(text, await schemaVersionOf(db));
  if (!parsed.ok) {
    return parsed;
  }
  try {
    await db.transaction(tx => replaceAll(tx, parsed.backup));
    return { ok: true };
  } catch {
    return { ok: false, error: 'invalid-file' };
  }
}

async function replaceAll(tx: SqlExecutor, backup: Backup): Promise<void> {
  for (const table of [...BACKUP_TABLES].reverse()) {
    await tx.execute(`DELETE FROM ${table}`);
  }
  for (const table of BACKUP_TABLES) {
    const columns = await columnsOf(tx, table);
    const insert = `INSERT INTO ${table} (${columns.join(
      ', ',
    )}) VALUES (${columns.map(() => '?').join(', ')})`;
    for (const row of backup.tables[table]) {
      assertColumns(table, row, columns);
      await tx.execute(
        insert,
        columns.map(column => row[column]),
      );
    }
  }
}

async function columnsOf(
  tx: SqlExecutor,
  table: BackupTable,
): Promise<string[]> {
  const rows = await tx.query(`PRAGMA table_info(${table})`);
  return rows.map(row => String(row.name));
}

function assertColumns(
  table: BackupTable,
  row: BackupRow,
  columns: readonly string[],
): void {
  const keys = Object.keys(row);
  if (
    keys.length !== columns.length ||
    !columns.every(column => column in row)
  ) {
    throw new Error(`Backup row of ${table} does not match its columns`);
  }
}

async function schemaVersionOf(db: Database): Promise<number> {
  const [row] = await db.query('PRAGMA user_version');
  return Number(row?.user_version ?? 0);
}

export type BackupService = {
  export(): Promise<string>;
  import(text: string): Promise<ImportBackupResult>;
};

export function createBackupService(db: Database): BackupService {
  return {
    export: () => exportBackup(db),
    import: text => importBackup(db, text),
  };
}
