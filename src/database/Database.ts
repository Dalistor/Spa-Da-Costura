export type SqlValue = string | number | null;

export type Row = Readonly<Record<string, SqlValue>>;

export type ExecuteResult = {
  changes: number;
  insertId?: number;
};

export interface SqlExecutor {
  execute(sql: string, params?: readonly SqlValue[]): Promise<ExecuteResult>;
  query(sql: string, params?: readonly SqlValue[]): Promise<Row[]>;
}

/**
 * Port to the local SQLite database. Only `src/database` and the
 * features' `data/` folders may depend on it.
 */
export interface Database extends SqlExecutor {
  /** Runs `work` atomically: any thrown error rolls every statement back. */
  transaction<T>(work: (tx: SqlExecutor) => Promise<T>): Promise<T>;
}
