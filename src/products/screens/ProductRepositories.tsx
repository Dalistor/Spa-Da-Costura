import { createContext, useContext, type ReactNode } from 'react';
import type { ProductRepository, ProductSaleRepository } from '../domain';

export type ProductRepositories = {
  products: ProductRepository;
  sales: ProductSaleRepository;
};

const ProductRepositoriesContext = createContext<ProductRepositories | null>(
  null,
);

/** Provided by the app's composition code, which builds the repositories. */
export function ProductRepositoriesProvider({
  repositories,
  children,
}: {
  repositories: ProductRepositories;
  children: ReactNode;
}) {
  return (
    <ProductRepositoriesContext.Provider value={repositories}>
      {children}
    </ProductRepositoriesContext.Provider>
  );
}

export function useProductRepositories(): ProductRepositories {
  const repositories = useContext(ProductRepositoriesContext);
  if (!repositories) {
    throw new Error(
      'useProductRepositories must be used inside ProductRepositoriesProvider',
    );
  }
  return repositories;
}
