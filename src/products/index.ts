export { createProductRepository, createProductSaleRepository } from './data';
export type {
  Product,
  ProductRepository,
  ProductSale,
  ProductSaleRepository,
} from './domain';
export { CatalogScreen } from './screens/CatalogScreen';
export { CustomerProductSalesSection } from './screens/CustomerProductSalesSection';
export {
  ProductRepositoriesProvider,
  type ProductRepositories,
} from './screens/ProductRepositories';
export { ProductFormScreen } from './screens/ProductFormScreen';
export { ProductSaleFormScreen } from './screens/ProductSaleFormScreen';
