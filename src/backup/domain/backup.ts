export const BACKUP_FORMAT = 'spa-da-costura-backup';

/**
 * Every table of the workshop, parents before children. Import deletes in
 * reverse order and inserts in this order, so foreign keys always hold.
 */
export const BACKUP_TABLES = [
  'customer',
  'measurement',
  'job',
  'product',
  'product_sale',
  'payment',
  'expense',
] as const;

export type BackupTable = (typeof BACKUP_TABLES)[number];

export type BackupValue = string | number | null;

export type BackupRow = Readonly<Record<string, BackupValue>>;

export type Backup = {
  format: typeof BACKUP_FORMAT;
  schemaVersion: number;
  createdAt: string;
  tables: Readonly<Record<BackupTable, readonly BackupRow[]>>;
};

export type ImportError = 'invalid-file' | 'newer-version';

export type ParseBackupResult =
  | { ok: true; backup: Backup }
  | { ok: false; error: ImportError };

/**
 * Reads a backup file written for `schemaVersion`. Only the same version is
 * accepted: converting older backups belongs to the next migration.
 */
export function parseBackup(
  text: string,
  schemaVersion: number,
): ParseBackupResult {
  const content = parseJson(text);
  if (!isBackup(content)) {
    return { ok: false, error: 'invalid-file' };
  }
  if (content.schemaVersion > schemaVersion) {
    return { ok: false, error: 'newer-version' };
  }
  if (content.schemaVersion < schemaVersion) {
    return { ok: false, error: 'invalid-file' };
  }
  return { ok: true, backup: content };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isBackup(content: unknown): content is Backup {
  if (!isRecord(content) || content.format !== BACKUP_FORMAT) {
    return false;
  }
  const { schemaVersion, createdAt, tables } = content;
  return (
    Number.isInteger(schemaVersion) &&
    typeof createdAt === 'string' &&
    isRecord(tables) &&
    BACKUP_TABLES.every(table => isRowList(tables[table]))
  );
}

function isRowList(rows: unknown): rows is BackupRow[] {
  return (
    Array.isArray(rows) &&
    rows.every(row => isRecord(row) && Object.values(row).every(isValue))
  );
}

function isValue(value: unknown): value is BackupValue {
  return (
    value === null || typeof value === 'string' || typeof value === 'number'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
