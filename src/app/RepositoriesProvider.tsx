import { useMemo, type ReactNode } from 'react';
import {
  CustomerRepositoriesProvider,
  createCustomerRepository,
  createMeasurementRepository,
} from '../customers';
import { useDatabase } from './DatabaseContext';

/** Builds each feature's repositories on the local database and hands them to its screens. */
export function RepositoriesProvider({ children }: { children: ReactNode }) {
  const database = useDatabase();
  const customerRepositories = useMemo(
    () => ({
      customers: createCustomerRepository(database),
      measurements: createMeasurementRepository(database),
    }),
    [database],
  );

  return (
    <CustomerRepositoriesProvider repositories={customerRepositories}>
      {children}
    </CustomerRepositoriesProvider>
  );
}
