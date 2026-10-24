import { useEffect, useState } from 'react';
import { initializeDatabase, type Database } from '../database';

export type DatabaseStartup =
  | { status: 'starting' }
  | { status: 'ready'; database: Database }
  | { status: 'failed'; error: unknown };

/** Opens and migrates the database once; the app renders nothing else until then. */
export function useDatabaseStartup(
  openDatabase: () => Database,
): DatabaseStartup {
  const [startup, setStartup] = useState<DatabaseStartup>({
    status: 'starting',
  });

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const database = openDatabase();
        await initializeDatabase(database);
        if (!cancelled) {
          setStartup({ status: 'ready', database });
        }
      } catch (error) {
        if (!cancelled) {
          setStartup({ status: 'failed', error });
        }
      }
    };
    start();
    return () => {
      cancelled = true;
    };
  }, [openDatabase]);

  return startup;
}
