import type { ListSearch, Page, PageRequest } from '../../search';
import type { Product, ProductInput, SaveProductResult } from './product';
import type {
  ProductSale,
  ProductSaleInput,
  SaveProductSaleResult,
} from './productSale';

export interface ProductRepository {
  /** Sorted by name. */
  list(): Promise<Product[]>;
  get(id: number): Promise<Product | null>;
  create(input: ProductInput): Promise<SaveProductResult>;
  update(id: number, input: ProductInput): Promise<SaveProductResult>;
  /** Sales of the product stay, keeping its name and amount. */
  remove(id: number): Promise<void>;
}

export interface ProductSaleRepository {
  /** Most recent first. */
  listForCustomer(customerId: number): Promise<ProductSale[]>;
  /** The customer's sales matching a product name, amount or date, most recent first. */
  searchForCustomer(
    customerId: number,
    search: ListSearch,
    page: PageRequest,
  ): Promise<Page<ProductSale>>;
  get(id: number): Promise<ProductSale | null>;
  /** Saves the typed amount and copies the product name. */
  create(
    customerId: number,
    input: ProductSaleInput,
  ): Promise<SaveProductSaleResult>;
  /** Picking another product copies its name; keeping it keeps the saved name. */
  update(id: number, input: ProductSaleInput): Promise<SaveProductSaleResult>;
  remove(id: number): Promise<void>;
}
