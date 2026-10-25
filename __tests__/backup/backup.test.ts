import { exportBackup, importBackup } from '../../src/backup';
import {
  createCustomerRepository,
  createMeasurementRepository,
} from '../../src/customers';
import { initializeDatabase, type Database } from '../../src/database';
import {
  createCashFlowRepository,
  createExpenseRepository,
  createPaymentRepository,
} from '../../src/finance';
import { createJobRepository } from '../../src/jobs';
import {
  createProductRepository,
  createProductSaleRepository,
} from '../../src/products';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';

const TABLES = [
  'customer',
  'measurement',
  'job',
  'product',
  'product_sale',
  'payment',
  'expense',
];

async function emptyDatabase(): Promise<Database> {
  const db = createNodeSqliteDatabase();
  await initializeDatabase(db);
  return db;
}

function unwrap<T>(
  result: ({ ok: true } & T) | { ok: false; error: string },
): T {
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result;
}

/** A workshop with every table filled, a deleted customer and a sale of a deleted product. */
async function filledDatabase() {
  const db = await emptyDatabase();
  const customers = createCustomerRepository(db);
  const { customer: maria } = unwrap(await customers.create({ name: 'Maria' }));
  const { customer: ana } = unwrap(
    await customers.create({ name: 'Ana', phone: '11 9999-0000' }),
  );
  await createMeasurementRepository(db).add(maria.id, {
    key: 'Busto',
    value: '90',
  });
  await createJobRepository(db).create(maria.id, {
    description: 'Bainha',
    amount: '100,00',
    deliveryDate: '2026-10-30',
  });
  const products = createProductRepository(db);
  const { product: dress } = unwrap(
    await products.create({ name: 'Vestido', price: '50' }),
  );
  const { product: skirt } = unwrap(
    await products.create({ name: 'Saia', price: '30' }),
  );
  const sales = createProductSaleRepository(db);
  await sales.create(maria.id, {
    productId: dress.id,
    amount: '50,00',
    date: '2026-10-24',
  });
  await sales.create(ana.id, {
    productId: skirt.id,
    amount: '30',
    date: '2026-10-20',
  });
  await products.remove(skirt.id);
  const payments = createPaymentRepository(db);
  await payments.create(maria.id, { amount: '40,00', date: '2026-10-24' });
  await payments.create(ana.id, { amount: '30', date: '2026-10-21' });
  await customers.remove(ana.id);
  await createExpenseRepository(db).create({
    description: 'Linha e botões',
    category: 'materials',
    amount: '35,00',
    date: '2026-10-22',
  });
  return { db, maria };
}

async function snapshot(db: Database) {
  const entries = await Promise.all(
    TABLES.map(
      async table =>
        [table, await db.query(`SELECT * FROM ${table} ORDER BY id`)] as const,
    ),
  );
  return Object.fromEntries(entries);
}

async function totals(db: Database, customerId: number) {
  return {
    customer: await createPaymentRepository(db).totalsFor(customerId),
    month: await createCashFlowRepository(db).totalsFor('2026-10'),
  };
}

describe('backup', () => {
  test('importing an export into another database leaves every table identical, deleted records included', async () => {
    const { db: source, maria } = await filledDatabase();
    const text = await exportBackup(source);

    const target = await emptyDatabase();
    const { customer: other } = unwrap(
      await createCustomerRepository(target).create({
        name: 'Depois do backup',
      }),
    );
    await createPaymentRepository(target).create(other.id, {
      amount: '10',
      date: '2026-10-25',
    });

    expect(await importBackup(target, text)).toEqual({ ok: true });

    const imported = await snapshot(target);
    expect(imported).toEqual(await snapshot(source));
    expect(imported.customer.map(row => row.name)).toEqual(['Maria', 'Ana']);
    expect(imported.customer[1].deleted_at).toEqual(expect.any(String));
    expect(imported.product_sale[1].product_id).toBeNull();
    expect(imported.payment.map(row => typeof row.amount_cents)).toEqual([
      'number',
      'number',
    ]);
    expect(await totals(target, maria.id)).toEqual(
      await totals(source, maria.id),
    );
  });

  test.each([
    ['text that is not JSON', () => '{"format": "spa-da-costura-backup",'],
    ['another JSON file', () => JSON.stringify({ name: 'Maria' })],
    [
      'a missing table',
      (backup: Backup) => {
        delete backup.tables.expense;
      },
    ],
    [
      'a missing column',
      (backup: Backup) => {
        delete backup.tables.payment[0].date;
      },
    ],
    [
      'an orphan payment',
      (backup: Backup) => {
        backup.tables.payment[0].customer_id = 999;
      },
    ],
    [
      'an expense category outside the three',
      (backup: Backup) => {
        backup.tables.expense[0].category = 'rent';
      },
    ],
    [
      'an amount in cents written as decimal',
      (backup: Backup) => {
        backup.tables.payment[0].amount_cents = 40.5;
      },
    ],
  ])(
    'a backup with %s is refused and the current data stays',
    async (_case, corrupt: (backup: Backup) => string | void) => {
      const { db: source } = await filledDatabase();
      const backup = JSON.parse(await exportBackup(source)) as Backup;
      const text = corrupt(backup) ?? JSON.stringify(backup);
      const { db: target } = await filledDatabase();
      await createCustomerRepository(target).create({
        name: 'Depois do backup',
      });
      const before = await snapshot(target);

      expect(await importBackup(target, text)).toEqual({
        ok: false,
        error: 'invalid-file',
      });
      expect(await snapshot(target)).toEqual(before);
    },
  );

  test('a backup from a newer schema version is refused and the current data stays', async () => {
    const { db } = await filledDatabase();
    const backup = JSON.parse(await exportBackup(db)) as Backup;
    backup.schemaVersion += 1;
    const before = await snapshot(db);

    expect(await importBackup(db, JSON.stringify(backup))).toEqual({
      ok: false,
      error: 'newer-version',
    });
    expect(await snapshot(db)).toEqual(before);
  });
});

type Backup = {
  schemaVersion: number;
  tables: Record<string, Array<Record<string, unknown>>>;
};
