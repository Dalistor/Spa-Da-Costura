import { createContext, useContext, type ReactNode } from 'react';
import type { BackupService } from '../data';

const BackupServiceContext = createContext<BackupService | null>(null);

/** Provided by the app's composition code, which binds it to the local database. */
export function BackupServiceProvider({
  service,
  children,
}: {
  service: BackupService;
  children: ReactNode;
}) {
  return (
    <BackupServiceContext.Provider value={service}>
      {children}
    </BackupServiceContext.Provider>
  );
}

export function useBackupService(): BackupService {
  const service = useContext(BackupServiceContext);
  if (!service) {
    throw new Error(
      'useBackupService must be used inside BackupServiceProvider',
    );
  }
  return service;
}
