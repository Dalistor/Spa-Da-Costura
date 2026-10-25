import { useMemo, type ReactNode } from 'react';
import { BackupServiceProvider, createBackupService } from '../backup';
import {
  CustomerRepositoriesProvider,
  createCustomerRepository,
  createMeasurementRepository,
} from '../customers';
import {
  createCashFlowRepository,
  createExpenseRepository,
  createPaymentRepository,
  FinanceRepositoriesProvider,
} from '../finance';
import { createJobRepository, JobRepositoryProvider } from '../jobs';
import {
  createProductRepository,
  createProductSaleRepository,
  ProductRepositoriesProvider,
} from '../products';
import { useDatabase } from './DatabaseContext';

/** Builds each feature's repositories and the backup on the local database and hands them to its screens. */
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
  const financeRepositories = useMemo(
    () => ({
      payments: createPaymentRepository(database),
      expenses: createExpenseRepository(database),
      cashFlow: createCashFlowRepository(database),
    }),
    [database],
  );
  const backupService = useMemo(
    () => createBackupService(database),
    [database],
  );

  return (
    <CustomerRepositoriesProvider repositories={customerRepositories}>
      <JobRepositoryProvider repository={jobRepository}>
        <ProductRepositoriesProvider repositories={productRepositories}>
          <FinanceRepositoriesProvider repositories={financeRepositories}>
            <BackupServiceProvider service={backupService}>
              {children}
            </BackupServiceProvider>
          </FinanceRepositoriesProvider>
        </ProductRepositoriesProvider>
      </JobRepositoryProvider>
    </CustomerRepositoriesProvider>
  );
}
