import { createCustomerRepository } from '../../src/customers';
import { initializeDatabase, type Database } from '../../src/database';
import {
  createProductRepository,
  createProductSaleRepository,
  type Product,
  type ProductSale,
} from '../../src/products';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';

async function setup() {
  const db = createNodeSqliteDatabase();
  await initializeDatabase(db);
  const customers = createCustomerRepository(db);
  const created = await Promise.all(
    ['Maria', 'Ana'].map(name => customers.create({ name })),
  );
  const [maria, ana] = created.map(result => {
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.customer;
  });
  return {
    db,
    products: createProductRepository(db),
    sales: createProductSaleRepository(db),
    maria,
    ana,
  };
}

async function count(db: Database, table: string): Promise<number> {
  const [row] = await db.query(`SELECT COUNT(*) AS total FROM ${table}`);
  return Number(row.total);
}

function product(
  result: { ok: true; product: Product } | { ok: false; error: string },
): Product {
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.product;
}

function sale(
  result: { ok: true; sale: ProductSale } | { ok: false; error: string },
): ProductSale {
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.sale;
}

describe('products', () => {
  test('a product stores its price in cents and the catalog is sorted by name', async () => {
    const { db, products } = await setup();

    const dress = product(
      await products.create({ name: ' Vestido de festa ', price: '350,00' }),
    );
    await products.create({ name: 'blusa', price: '80' });

    expect(dress).toEqual({
      id: expect.any(Number),
      name: 'Vestido de festa',
      priceCents: 35000,
    });
    const [row] = await db.query(
      'SELECT price_cents, typeof(price_cents) AS type FROM product WHERE id = ?',
      [dress.id],
    );
    expect(row).toEqual({ price_cents: 35000, type: 'integer' });
    expect((await products.list()).map(item => item.name)).toEqual([
      'blusa',
      'Vestido de festa',
    ]);
  });

  test.each([
    [{ name: '  ', price: '10,00' }, 'name-required'],
    [{ name: 'Vestido', price: 'abc' }, 'price-invalid'],
    [{ name: 'Vestido', price: '' }, 'price-invalid'],
    [{ name: 'Vestido', price: '-5' }, 'price-invalid'],
  ])(
    'an invalid product is refused and nothing is saved: %o',
    async (input, error) => {
      const { db, products } = await setup();

      expect(await products.create(input)).toEqual({ ok: false, error });
      expect(await count(db, 'product')).toBe(0);
    },
  );
});

describe('product sales', () => {
  test('a sale stores the typed amount and the product name, not the current price', async () => {
    const { db, products, sales, maria } = await setup();
    const dress = product(
      await products.create({ name: 'Vestido de festa', price: '350,00' }),
    );

    const sold = sale(
      await sales.create(maria.id, {
        productId: dress.id,
        amount: '320,00',
        date: '2026-10-24',
      }),
    );

    expect(sold).toEqual({
      id: expect.any(Number),
      customerId: maria.id,
      productId: dress.id,
      productName: 'Vestido de festa',
      amountCents: 32000,
      date: '2026-10-24',
    });
    const [row] = await db.query(
      'SELECT amount_cents, typeof(amount_cents) AS type FROM product_sale',
    );
    expect(row).toEqual({ amount_cents: 32000, type: 'integer' });
  });

  test.each([
    [{ productId: null, amount: '', date: '2026-10-24' }, 'product-required'],
    [{ productId: 999, amount: '10', date: '2026-10-24' }, 'product-required'],
    [{ productId: 'dress', amount: 'abc', date: '2026-10-24' }, 'amount-invalid'],
    [{ productId: 'dress', amount: '10', date: '24/10/2026' }, 'date-invalid'],
  ] as const)(
    'an invalid sale is refused and nothing is saved: %o',
    async (input, error) => {
      const { db, products, sales, maria } = await setup();
      const dress = product(
        await products.create({ name: 'Vestido', price: '100' }),
      );
      const productId = input.productId === 'dress' ? dress.id : input.productId;

      expect(await sales.create(maria.id, { ...input, productId })).toEqual({
        ok: false,
        error,
      });
      expect(await count(db, 'product_sale')).toBe(0);
    },
  );

  test('changing the price or deleting the product keeps past sales with name and amount', async () => {
    const { products, sales, maria } = await setup();
    const dress = product(
      await products.create({ name: 'Vestido de festa', price: '350,00' }),
    );
    const sold = sale(
      await sales.create(maria.id, {
        productId: dress.id,
        amount: '320,00',
        date: '2026-10-24',
      }),
    );

    expect(
      await products.update(dress.id, { name: 'Vestido longo', price: '400' }),
    ).toMatchObject({ ok: true });
    expect(await sales.listForCustomer(maria.id)).toEqual([sold]);

    await products.remove(dress.id);

    expect(await products.list()).toEqual([]);
    expect(await sales.listForCustomer(maria.id)).toEqual([
      { ...sold, productId: null },
    ]);
  });

  test('editing and deleting affect only the chosen sale, and each customer sees only theirs', async () => {
    const { products, sales, maria, ana } = await setup();
    const dress = product(
      await products.create({ name: 'Vestido', price: '300' }),
    );
    const skirt = product(await products.create({ name: 'Saia', price: '90' }));
    const first = sale(
      await sales.create(maria.id, {
        productId: dress.id,
        amount: '300',
        date: '2026-10-20',
      }),
    );
    const second = sale(
      await sales.create(maria.id, {
        productId: dress.id,
        amount: '280',
        date: '2026-10-22',
      }),
    );
    const others = sale(
      await sales.create(ana.id, {
        productId: skirt.id,
        amount: '90',
        date: '2026-10-21',
      }),
    );

    expect(
      await sales.update(first.id, {
        productId: skirt.id,
        amount: '85,50',
        date: '2026-10-23',
      }),
    ).toMatchObject({ ok: true });
    expect(
      await sales.update(first.id, {
        productId: skirt.id,
        amount: 'abc',
        date: '2026-10-23',
      }),
    ).toEqual({ ok: false, error: 'amount-invalid' });

    const edited = {
      ...first,
      productId: skirt.id,
      productName: 'Saia',
      amountCents: 8550,
      date: '2026-10-23',
    };
    expect(await sales.listForCustomer(maria.id)).toEqual([edited, second]);
    expect(await sales.get(first.id)).toEqual(edited);

    await sales.remove(second.id);

    expect(await sales.listForCustomer(maria.id)).toEqual([edited]);
    expect(await sales.listForCustomer(ana.id)).toEqual([others]);
  });

  test('editing a sale of a deleted product keeps its name', async () => {
    const { products, sales, maria } = await setup();
    const dress = product(
      await products.create({ name: 'Vestido', price: '300' }),
    );
    const sold = sale(
      await sales.create(maria.id, {
        productId: dress.id,
        amount: '300',
        date: '2026-10-20',
      }),
    );
    await products.remove(dress.id);

    expect(
      await sales.update(sold.id, {
        productId: null,
        amount: '250',
        date: '2026-10-20',
      }),
    ).toEqual({
      ok: true,
      sale: { ...sold, productId: null, amountCents: 25000 },
    });
  });
});
