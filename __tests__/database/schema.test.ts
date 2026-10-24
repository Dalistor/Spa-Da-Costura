import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  initializeDatabase,
  MIGRATIONS,
  migrate,
  type Database,
  type Migration,
} from '../../src/database';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';

const DOMAIN_TABLES = [
  'customer',
  'expense',
  'job',
  'measurement',
  'payment',
  'product',
  'product_sale',
];

async function userVersion(db: Database): Promise<number> {
  const [row] = await db.query('PRAGMA user_version');
  return Number(row.user_version);
}

async function tableNames(db: Database): Promise<string[]> {
  const rows = await db.query(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  return rows.map(row => String(row.name));
}

async function count(db: Database, table: string): Promise<number> {
  const [row] = await db.query(`SELECT COUNT(*) AS total FROM ${table}`);
  return Number(row.total);
}

describe('migrations', () => {
  test('an empty database reaches the latest version with every domain table', async () => {
    const db = createNodeSqliteDatabase();
    await initializeDatabase(db);

    expect(await userVersion(db)).toBe(MIGRATIONS.length);
    expect(await tableNames(db)).toEqual(DOMAIN_TABLES);
    const [fk] = await db.query('PRAGMA foreign_keys');
    expect(Number(fk.foreign_keys)).toBe(1);
  });

  test('reopening the database keeps the data and does not reapply migrations', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spa-db-'));
    const file = path.join(dir, 'app.db');
    const first = createNodeSqliteDatabase(file);
    await initializeDatabase(first);
    await first.execute("INSERT INTO customer (name) VALUES ('Ana')");
    first.close();

    const second = createNodeSqliteDatabase(file);
    await initializeDatabase(second);

    expect(await userVersion(second)).toBe(MIGRATIONS.length);
    expect(await count(second, 'customer')).toBe(1);
    second.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('a failing migration is rolled back and keeps the previous version and data', async () => {
    const db = createNodeSqliteDatabase();
    await initializeDatabase(db);
    await db.execute("INSERT INTO customer (name) VALUES ('Ana')");
    const broken: Migration = {
      version: MIGRATIONS.length + 1,
      statements: [
        'CREATE TABLE half_done (id INTEGER PRIMARY KEY)',
        'DELETE FROM customer',
        'THIS IS NOT SQL',
      ],
    };

    await expect(migrate(db, [...MIGRATIONS, broken])).rejects.toThrow();

    expect(await userVersion(db)).toBe(MIGRATIONS.length);
    expect(await tableNames(db)).not.toContain('half_done');
    expect(await count(db, 'customer')).toBe(1);
  });

  test('a database newer than the app is refused', async () => {
    const db = createNodeSqliteDatabase();
    await db.execute(`PRAGMA user_version = ${MIGRATIONS.length + 1}`);

    await expect(initializeDatabase(db)).rejects.toThrow(/newer/);
  });

  test('migration versions must be sequential', async () => {
    const db = createNodeSqliteDatabase();
    const gap: Migration[] = [{ version: 2, statements: [] }];

    await expect(migrate(db, gap)).rejects.toThrow(/sequential/);
  });
});

describe('schema relations and constraints', () => {
  let db: Database;
  let customerId: number;

  beforeEach(async () => {
    db = createNodeSqliteDatabase();
    await initializeDatabase(db);
    const result = await db.execute(
      "INSERT INTO customer (name) VALUES ('Ana')",
    );
    customerId = result.insertId!;
  });

  test.each([
    ["INSERT INTO measurement (customer_id, key, value) VALUES (999, 'Cintura', '72 cm')"],
    ["INSERT INTO job (customer_id, description, amount_cents, delivery_date) VALUES (999, 'Barra', 1000, '2026-10-24')"],
    ["INSERT INTO product_sale (customer_id, product_name, amount_cents, date) VALUES (999, 'Vestido', 1000, '2026-10-24')"],
    ["INSERT INTO payment (customer_id, amount_cents, date) VALUES (999, 1000, '2026-10-24')"],
  ])('refuses orphan records: %s', async sql => {
    await expect(db.execute(sql)).rejects.toThrow(/FOREIGN KEY/);
  });

  test('a customer with payments cannot be physically deleted', async () => {
    await db.execute(
      "INSERT INTO payment (customer_id, amount_cents, date) VALUES (?, 4000, '2026-10-24')",
      [customerId],
    );

    await expect(
      db.execute('DELETE FROM customer WHERE id = ?', [customerId]),
    ).rejects.toThrow(/FOREIGN KEY/);
    expect(await count(db, 'payment')).toBe(1);
  });

  test('deleting a product keeps its sales with name and amount', async () => {
    const product = await db.execute(
      "INSERT INTO product (name, price_cents) VALUES ('Vestido', 15000)",
    );
    await db.execute(
      "INSERT INTO product_sale (customer_id, product_id, product_name, amount_cents, date) VALUES (?, ?, 'Vestido', 12000, '2026-10-24')",
      [customerId, product.insertId!],
    );

    await db.execute('DELETE FROM product WHERE id = ?', [product.insertId!]);

    const [sale] = await db.query(
      'SELECT product_id, product_name, amount_cents FROM product_sale',
    );
    expect(sale).toEqual({
      product_id: null,
      product_name: 'Vestido',
      amount_cents: 12000,
    });
  });

  test('a new job starts as pending', async () => {
    await db.execute(
      "INSERT INTO job (customer_id, description, amount_cents, delivery_date) VALUES (?, 'Barra', 3000, '2026-10-24')",
      [customerId],
    );
    const [job] = await db.query('SELECT status FROM job');
    expect(job.status).toBe('pending');
  });

  test('the same measurement key is refused twice for one customer', async () => {
    const sql =
      "INSERT INTO measurement (customer_id, key, value) VALUES (?, 'Cintura', '72 cm')";
    await db.execute(sql, [customerId]);
    await expect(db.execute(sql, [customerId])).rejects.toThrow(/UNIQUE/);
  });

  test.each([
    ["INSERT INTO customer (name) VALUES ('  ')"],
    ["INSERT INTO measurement (customer_id, key, value) VALUES (1, '', '72')"],
    ["INSERT INTO job (customer_id, description, amount_cents, delivery_date, status) VALUES (1, 'Barra', 100, '2026-10-24', 'lost')"],
    ["INSERT INTO job (customer_id, description, amount_cents, delivery_date) VALUES (1, 'Barra', -1, '2026-10-24')"],
    ["INSERT INTO job (customer_id, description, amount_cents, delivery_date) VALUES (1, 'Barra', 10.5, '2026-10-24')"],
    ["INSERT INTO job (customer_id, description, amount_cents, delivery_date) VALUES (1, 'Barra', 100, '24/10/2026')"],
    ["INSERT INTO product (name, price_cents) VALUES ('Vestido', -100)"],
    ["INSERT INTO payment (customer_id, amount_cents, date) VALUES (1, 0, '2026-10-24')"],
    ["INSERT INTO expense (description, category, amount_cents, date) VALUES ('Linha', 'food', 100, '2026-10-24')"],
    ["INSERT INTO expense (description, category, amount_cents, date) VALUES ('Linha', 'materials', 0, '2026-10-24')"],
  ])('refuses invalid values: %s', async sql => {
    await expect(db.execute(sql)).rejects.toThrow(/CHECK/);
  });
});
