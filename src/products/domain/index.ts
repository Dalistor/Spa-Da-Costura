export {
  compareByName,
  validateProduct,
  type Product,
  type ProductError,
  type ProductInput,
  type SaveProductResult,
} from './product';
export {
  validateProductSale,
  type ProductSale,
  type ProductSaleError,
  type ProductSaleInput,
  type SaveProductSaleResult,
} from './productSale';
export type { ProductRepository, ProductSaleRepository } from './repositories';
