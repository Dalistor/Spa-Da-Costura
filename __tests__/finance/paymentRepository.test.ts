import { createCustomerRepository } from '../../src/customers';
import { initializeDatabase, type Database } from '../../src/database';
import {
  customerBalance,
  exceedsAmountDue,
  totalAmountDue,
  createPaymentRepository,
  type Payment,
} from '../../src/finance';
import { createJobRepository } from '../../src/jobs';
import {
  createProductRepository,
  createProductSaleRepository,
} from '../../src/products';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';

async function setup() {
  const db = createNodeSqliteDatabase();
  await initializeDatabase(db);
  const customers = createCustomerRepository(db);
  const created = await Promise.all(
    ['Maria', 'Ana', 'Lúcia'].map(name => customers.create({ name })),
  );
  const [maria, ana, lucia] = created.map(result => {
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.customer;
  });
  return {
    db,
    jobs: createJobRepository(db),
    products: createProductRepository(db),
    sales: createProductSaleRepository(db),
    customers,
    payments: createPaymentRepository(db),
    maria,
    ana,
    lucia,
  };
}

async function count(db: Database): Promise<number> {
  const [row] = await db.query('SELECT COUNT(*) AS total FROM payment');
  return Number(row.total);
}

function payment(
  result: { ok: true; payment: Payment } | { ok: false; error: string },
): Payment {
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.payment;
}

describe('customer balance', () => {
  test('pays part of the charges: paid 40,00 and due 110,00 without credit', () => {
    expect(customerBalance({ chargedCents: 15000, paidCents: 4000 })).toEqual({
      totalPaid: 4000,
      amountDue: 11000,
      credit: 0,
    });
  });

  test('pays more than the charges: due 0,00 and credit 30,00', () => {
    expect(customerBalance({ chargedCents: 10000, paidCents: 13000 })).toEqual({
      totalPaid: 13000,
      amountDue: 0,
      credit: 3000,
    });
  });

  test('a payment exceeds the amount due only past the exact remainder', () => {
    const totals = { chargedCents: 15000, paidCents: 4000 };

    expect(exceedsAmountDue(totals, 11000)).toBe(false);
    expect(exceedsAmountDue(totals, 11001)).toBe(true);
  });

  test('editing a payment ignores its old amount', () => {
    const totals = { chargedCents: 15000, paidCents: 4000 };

    expect(exceedsAmountDue(totals, 15000, 4000)).toBe(false);
    expect(exceedsAmountDue(totals, 15001, 4000)).toBe(true);
  });
});

describe('payments', () => {
  test.each([['0'], ['-5'], [''], ['abc']])(
    'a payment of "%s" is refused and nothing is saved',
    async amount => {
      const { db, payments, maria } = await setup();

      expect(
        await payments.create(maria.id, { amount, date: '2026-10-24' }),
      ).toEqual({ ok: false, error: 'amount-invalid' });
      expect(await count(db)).toBe(0);
    },
  );

  test('a payment without a valid date is refused', async () => {
    const { db, payments, maria } = await setup();

    expect(
      await payments.create(maria.id, { amount: '40', date: '24/10/2026' }),
    ).toEqual({ ok: false, error: 'date-invalid' });
    expect(await count(db)).toBe(0);
  });

  test("the totals count only the customer's jobs, sales and payments, following edits and deletions", async () => {
    const { db, jobs, products, sales, payments, maria, ana } = await setup();
    await jobs.create(maria.id, {
      description: 'Bainha',
      amount: '100,00',
      deliveryDate: '2026-10-30',
    });
    const dress = await products.create({ name: 'Vestido', price: '50' });
    if (!dress.ok) {
      throw new Error(dress.error);
    }
    await sales.create(maria.id, {
      productId: dress.product.id,
      amount: '50,00',
      date: '2026-10-24',
    });
    await jobs.create(ana.id, {
      description: 'Zíper',
      amount: '30',
      deliveryDate: '2026-10-30',
    });
    await payments.create(ana.id, { amount: '30', date: '2026-10-24' });

    const first = payment(
      await payments.create(maria.id, { amount: '40,00', date: '2026-10-20' }),
    );
    const second = payment(
      await payments.create(maria.id, { amount: '90,00', date: '2026-10-24' }),
    );

    expect(first).toEqual({
      id: expect.any(Number),
      customerId: maria.id,
      amountCents: 4000,
      date: '2026-10-20',
    });
    const [row] = await db.query(
      'SELECT typeof(amount_cents) AS type FROM payment WHERE id = ?',
      [first.id],
    );
    expect(row).toEqual({ type: 'integer' });
    expect(await payments.listForCustomer(maria.id)).toEqual([second, first]);
    expect(await payments.totalsFor(maria.id)).toEqual({
      chargedCents: 15000,
      paidCents: 13000,
    });

    const edited = payment(
      await payments.update(second.id, { amount: '60', date: '2026-10-25' }),
    );
    expect(edited).toEqual({
      ...second,
      amountCents: 6000,
      date: '2026-10-25',
    });
    expect(await payments.totalsFor(maria.id)).toEqual({
      chargedCents: 15000,
      paidCents: 10000,
    });

    await payments.remove(first.id);

    expect(await payments.listForCustomer(maria.id)).toEqual([edited]);
    expect(await payments.totalsFor(maria.id)).toEqual({
      chargedCents: 15000,
      paidCents: 6000,
    });
    expect(await payments.totalsFor(ana.id)).toEqual({
      chargedCents: 3000,
      paidCents: 3000,
    });
  });

  test('editing a payment that no longer exists is refused', async () => {
    const { payments } = await setup();

    expect(
      await payments.update(999, { amount: '10', date: '2026-10-24' }),
    ).toEqual({ ok: false, error: 'not-found' });
  });
});

describe('amounts due across customers', () => {
  test('lists only active customers who still owe, largest amount first', async () => {
    const { customers, jobs, products, sales, payments, maria, ana, lucia } =
      await setup();
    await jobs.create(maria.id, {
      description: 'Bainha',
      amount: '35,50',
      deliveryDate: '2026-10-30',
    });
    await payments.create(maria.id, { amount: '10,25', date: '2026-10-24' });
    const coat = await products.create({ name: 'Casaco', price: '120' });
    if (!coat.ok) {
      throw new Error(coat.error);
    }
    await sales.create(ana.id, {
      productId: coat.product.id,
      amount: '120,00',
      date: '2026-10-24',
    });
    await jobs.create(ana.id, {
      description: 'Zíper',
      amount: '0,10',
      deliveryDate: '2026-10-30',
    });
    // Paid beyond the charges: a credit, not a debt.
    await jobs.create(lucia.id, {
      description: 'Ajuste',
      amount: '20',
      deliveryDate: '2026-10-30',
    });
    await payments.create(lucia.id, { amount: '25', date: '2026-10-24' });

    expect(await payments.listAmountsDue()).toEqual([
      { customerId: ana.id, customerName: 'Ana', amountDueCents: 12010 },
      { customerId: maria.id, customerName: 'Maria', amountDueCents: 2525 },
    ]);

    expect(totalAmountDue(await payments.listAmountsDue())).toBe(14535);

    await customers.remove(ana.id);

    expect(await payments.listAmountsDue()).toEqual([
      { customerId: maria.id, customerName: 'Maria', amountDueCents: 2525 },
    ]);
  });
});
