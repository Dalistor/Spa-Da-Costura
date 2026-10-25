import { parseCents, type Cents } from '../../money';

/** A whole piece (peça) in the catalog, sold to customers. */
export type Product = {
  id: number;
  name: string;
  priceCents: Cents;
};

/** What the seamstress types; the price is text in reais ("350,00"). */
export type ProductInput = {
  name: string;
  price: string;
};

export type ProductError = 'name-required' | 'price-invalid' | 'not-found';

export type SaveProductResult =
  | { ok: true; product: Product }
  | { ok: false; error: ProductError };

export type ValidProduct = Omit<Product, 'id'>;

export function validateProduct(
  input: ProductInput,
):
  | { ok: true; product: ValidProduct }
  | { ok: false; error: Exclude<ProductError, 'not-found'> } {
  const name = input.name.trim();
  if (name === '') {
    return { ok: false, error: 'name-required' };
  }
  const price = parseCents(input.price);
  if (!price.ok) {
    return { ok: false, error: 'price-invalid' };
  }
  return { ok: true, product: { name, priceCents: price.cents } };
}

const nameCollator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export function compareByName(a: Product, b: Product): number {
  return nameCollator.compare(a.name, b.name);
}
