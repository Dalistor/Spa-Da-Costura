import { createContext, useContext, type ReactNode } from 'react';
import type { Database } from '../database';

const DatabaseContext = createContext<Database | null>(null);

export function DatabaseProvider({
  database,
  children,
}: {
  database: Database;
  children: ReactNode;
}) {
  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  );
}

/** Used by the composition code that builds repositories for the screens. */
export function useDatabase(): Database {
  const database = useContext(DatabaseContext);
  if (!database) {
    throw new Error('useDatabase must be used inside DatabaseProvider');
  }
  return database;
}
