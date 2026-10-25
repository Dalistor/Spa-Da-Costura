import { useMemo, type ReactNode } from 'react';
import {
  CustomerRepositoriesProvider,
  createCustomerRepository,
  createMeasurementRepository,
} from '../customers';
import { createJobRepository, JobRepositoryProvider } from '../jobs';
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
  const jobRepository = useMemo(
    () => createJobRepository(database),
    [database],
  );

  return (
    <CustomerRepositoriesProvider repositories={customerRepositories}>
      <JobRepositoryProvider repository={jobRepository}>
        {children}
      </JobRepositoryProvider>
    </CustomerRepositoriesProvider>
  );
}
