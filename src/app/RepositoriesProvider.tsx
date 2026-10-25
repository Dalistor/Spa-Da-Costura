import { useMemo, type ReactNode } from 'react';
import {
  CustomerRepositoriesProvider,
  createCustomerRepository,
  createMeasurementRepository,
} from '../customers';
import { createJobRepository, JobRepositoryProvider } from '../jobs';
import {
  createProductRepository,
  createProductSaleRepository,
  ProductRepositoriesProvider,
} from '../products';
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
  const productRepositories = useMemo(
    () => ({
      products: createProductRepository(database),
      sales: createProductSaleRepository(database),
    }),
    [database],
  );

  return (
    <CustomerRepositoriesProvider repositories={customerRepositories}>
      <JobRepositoryProvider repository={jobRepository}>
        <ProductRepositoriesProvider repositories={productRepositories}>
          {children}
        </ProductRepositoriesProvider>
      </JobRepositoryProvider>
    </CustomerRepositoriesProvider>
  );
}
