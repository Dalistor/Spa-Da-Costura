import { isBusinessDate, type BusinessDate } from '../../calendar';
import { parseCents, type Cents } from '../../money';

/**
 * A product sold to a customer. Name and amount are copied at sale time,
 * so later price changes or deleting the product never change the sale.
 */
export type ProductSale = {
  id: number;
  customerId: number;
  /** Null once the product was deleted from the catalog. */
  productId: number | null;
  productName: string;
  amountCents: Cents;
  date: BusinessDate;
};

/**
 * What the seamstress picks and types; the amount is text in reais.
 * `productId` is null only when editing a sale whose product was deleted.
 */
export type ProductSaleInput = {
  productId: number | null;
  amount: string;
  date: BusinessDate;
};

export type ProductSaleError =
  | 'product-required'
  | 'amount-invalid'
  | 'date-invalid'
  | 'not-found';

export type SaveProductSaleResult =
  | { ok: true; sale: ProductSale }
  | { ok: false; error: ProductSaleError };

export type ValidProductSale = Pick<ProductSale, 'amountCents' | 'date'>;

/** Validates what the seamstress typed; the product is resolved by the repository. */
export function validateProductSale(
  input: ProductSaleInput,
):
  | { ok: true; sale: ValidProductSale }
  | { ok: false; error: 'amount-invalid' | 'date-invalid' } {
  const amount = parseCents(input.amount);
  if (!amount.ok) {
    return { ok: false, error: 'amount-invalid' };
  }
  if (!isBusinessDate(input.date)) {
    return { ok: false, error: 'date-invalid' };
  }
  return { ok: true, sale: { amountCents: amount.cents, date: input.date } };
}
