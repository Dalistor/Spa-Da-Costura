import { createContext, useContext, type ReactNode } from 'react';
import type {
  CashFlowRepository,
  ExpenseRepository,
  PaymentRepository,
} from '../domain';

export type FinanceRepositories = {
  payments: PaymentRepository;
  expenses: ExpenseRepository;
  cashFlow: CashFlowRepository;
};

const FinanceRepositoriesContext = createContext<FinanceRepositories | null>(
  null,
);

/** Provided by the app's composition code, which builds the repositories. */
export function FinanceRepositoriesProvider({
  repositories,
  children,
}: {
  repositories: FinanceRepositories;
  children: ReactNode;
}) {
  return (
    <FinanceRepositoriesContext.Provider value={repositories}>
      {children}
    </FinanceRepositoriesContext.Provider>
  );
}

export function useFinanceRepositories(): FinanceRepositories {
  const repositories = useContext(FinanceRepositoriesContext);
  if (!repositories) {
    throw new Error(
      'useFinanceRepositories must be used inside FinanceRepositoriesProvider',
    );
  }
  return repositories;
}
