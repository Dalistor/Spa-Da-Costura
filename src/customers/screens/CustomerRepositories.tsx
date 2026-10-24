import { createContext, useContext, type ReactNode } from 'react';
import type { CustomerRepository, MeasurementRepository } from '../domain';

export type CustomerRepositories = {
  customers: CustomerRepository;
  measurements: MeasurementRepository;
};

const CustomerRepositoriesContext = createContext<CustomerRepositories | null>(
  null,
);

/** Provided by the app's composition code, which builds the repositories. */
export function CustomerRepositoriesProvider({
  repositories,
  children,
}: {
  repositories: CustomerRepositories;
  children: ReactNode;
}) {
  return (
    <CustomerRepositoriesContext.Provider value={repositories}>
      {children}
    </CustomerRepositoriesContext.Provider>
  );
}

export function useCustomerRepositories(): CustomerRepositories {
  const repositories = useContext(CustomerRepositoriesContext);
  if (!repositories) {
    throw new Error(
      'useCustomerRepositories must be used inside CustomerRepositoriesProvider',
    );
  }
  return repositories;
}
