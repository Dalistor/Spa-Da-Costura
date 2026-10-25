import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createCustomerRepository,
  createMeasurementRepository,
  searchByName,
  type Customer,
} from '../../src/customers';
import { initializeDatabase, type Database } from '../../src/database';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';

async function openDatabase(file?: string) {
  const database = createNodeSqliteDatabase(file);
  await initializeDatabase(database);
  return database;
}

async function count(db: Database, table: string): Promise<number> {
  const [row] = await db.query(`SELECT COUNT(*) AS total FROM ${table}`);
  return Number(row.total);
}

async function createCustomer(db: Database, name: string): Promise<Customer> {
  const result = await createCustomerRepository(db).create({ name });
  if (!result.ok) {
    throw new Error(`could not create ${name}: ${result.error}`);
  }
  return result.customer;
}

describe('customers', () => {
  test('a customer is saved with or without phone and description', async () => {
    const db = await openDatabase();
    const customers = createCustomerRepository(db);

    const full = await customers.create({
      name: '  Maria Souza ',
      phone: '(11) 98888-7777',
      description: 'Prefere barra italiana',
    });
    const minimal = await customers.create({
      name: 'Ana',
      phone: '  ',
      description: '',
    });

    expect(full).toEqual({
      ok: true,
      customer: {
        id: expect.any(Number),
        name: 'Maria Souza',
        phone: '(11) 98888-7777',
        description: 'Prefere barra italiana',
      },
    });
    expect(minimal).toMatchObject({
      ok: true,
      customer: { name: 'Ana', phone: null, description: null },
    });
    expect((await customers.list()).map(c => c.name)).toEqual([
      'Ana',
      'Maria Souza',
    ]);
  });

  test('a customer without a name is refused and nothing is saved', async () => {
    const db = await openDatabase();

    const result = await createCustomerRepository(db).create({
      name: '   ',
      phone: '1234',
    });

    expect(result).toEqual({ ok: false, error: 'name-required' });
    expect(await count(db, 'customer')).toBe(0);
  });

  test('editing a customer changes only that customer', async () => {
    const db = await openDatabase();
    const customers = createCustomerRepository(db);
    const maria = await createCustomer(db, 'Maria');
    const ana = await createCustomer(db, 'Ana');

    const edited = await customers.update(maria.id, {
      name: 'Maria Souza',
      phone: '1199',
      description: 'Cliente antiga',
    });
    const refused = await customers.update(maria.id, { name: '' });

    expect(edited.ok).toBe(true);
    expect(refused).toEqual({ ok: false, error: 'name-required' });
    expect(await customers.get(maria.id)).toEqual({
      id: maria.id,
      name: 'Maria Souza',
      phone: '1199',
      description: 'Cliente antiga',
    });
    expect(await customers.get(ana.id)).toEqual(ana);
  });

  test('deleting a customer hides it and its measurements but keeps every record', async () => {
    const db = await openDatabase();
    const customers = createCustomerRepository(db);
    const measurements = createMeasurementRepository(db);
    const gone = await createCustomer(db, 'Excluída');
    await createCustomer(db, 'Ativa');
    await measurements.add(gone.id, { key: 'Cintura', value: '72 cm' });
    await db.execute(
      "INSERT INTO payment (customer_id, amount_cents, date) VALUES (?, 4000, '2026-10-24')",
      [gone.id],
    );
    await db.execute(
      "INSERT INTO job (customer_id, description, amount_cents, delivery_date) VALUES (?, 'Barra', 3000, '2026-10-24')",
      [gone.id],
    );
    await db.execute(
      "INSERT INTO product_sale (customer_id, product_name, amount_cents, date) VALUES (?, 'Vestido', 12000, '2026-10-24')",
      [gone.id],
    );

    expect(await customers.remove(gone.id)).toBe(true);

    expect((await customers.list()).map(c => c.name)).toEqual(['Ativa']);
    expect(await customers.get(gone.id)).toBeNull();
    expect(await measurements.listFor(gone.id)).toEqual([]);
    expect(await customers.update(gone.id, { name: 'Volta' })).toEqual({
      ok: false,
      error: 'not-found',
    });
    expect(await customers.remove(gone.id)).toBe(false);
    const [row] = await db.query(
      'SELECT name, deleted_at FROM customer WHERE id = ?',
      [gone.id],
    );
    expect(row.name).toBe('Excluída');
    expect(row.deleted_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    for (const table of ['measurement', 'payment', 'job', 'product_sale']) {
      expect(await count(db, table)).toBe(1);
    }
  });

  test('saved customers and measurements survive reopening the database', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spa-customers-'));
    const file = path.join(dir, 'app.db');
    const first = await openDatabase(file);
    const maria = await createCustomer(first, 'Maria');
    await createMeasurementRepository(first).add(maria.id, {
      key: 'Cintura',
      value: '72 cm',
    });
    first.close();

    const reopened = await openDatabase(file);

    expect(await createCustomerRepository(reopened).list()).toEqual([maria]);
    expect(
      await createMeasurementRepository(reopened).listFor(maria.id),
    ).toMatchObject([{ key: 'Cintura', value: '72 cm' }]);
    reopened.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('measurements', () => {
  test('adding, editing and removing a measurement affects only its customer', async () => {
    const db = await openDatabase();
    const measurements = createMeasurementRepository(db);
    const maria = await createCustomer(db, 'Maria');
    const ana = await createCustomer(db, 'Ana');
    await measurements.add(ana.id, { key: 'Cintura', value: '80 cm' });

    const added = await measurements.add(maria.id, {
      key: ' Cintura ',
      value: ' 72 cm ',
    });
    if (!added.ok) {
      throw new Error(added.error);
    }
    expect(added.measurement).toEqual({
      id: expect.any(Number),
      customerId: maria.id,
      key: 'Cintura',
      value: '72 cm',
    });

    expect(
      await measurements.update(added.measurement.id, {
        key: 'Quadril',
        value: '98 cm',
      }),
    ).toMatchObject({
      ok: true,
    });
    expect(await measurements.listFor(maria.id)).toMatchObject([
      { key: 'Quadril', value: '98 cm' },
    ]);

    await measurements.remove(added.measurement.id);
    expect(await measurements.listFor(maria.id)).toEqual([]);
    expect(await measurements.listFor(ana.id)).toMatchObject([
      { key: 'Cintura', value: '80 cm' },
    ]);
  });

  test('an empty key is refused', async () => {
    const db = await openDatabase();
    const maria = await createCustomer(db, 'Maria');

    expect(
      await createMeasurementRepository(db).add(maria.id, {
        key: '  ',
        value: '72',
      }),
    ).toEqual({
      ok: false,
      error: 'key-required',
    });
    expect(await count(db, 'measurement')).toBe(0);
  });

  test('a repeated key in the same customer is refused ignoring letter case, also when editing', async () => {
    const db = await openDatabase();
    const measurements = createMeasurementRepository(db);
    const maria = await createCustomer(db, 'Maria');
    await measurements.add(maria.id, { key: 'Cintura', value: '72 cm' });
    const bust = await measurements.add(maria.id, {
      key: 'Busto',
      value: '90 cm',
    });
    if (!bust.ok) {
      throw new Error(bust.error);
    }

    expect(
      await measurements.add(maria.id, { key: 'cintura ', value: '70 cm' }),
    ).toEqual({
      ok: false,
      error: 'key-taken',
    });
    expect(
      await measurements.update(bust.measurement.id, {
        key: 'CINTURA',
        value: '90 cm',
      }),
    ).toEqual({
      ok: false,
      error: 'key-taken',
    });
    expect(
      await measurements.update(bust.measurement.id, {
        key: 'busto',
        value: '92 cm',
      }),
    ).toMatchObject({
      ok: true,
    });
    await measurements.add(maria.id, { key: 'Ômbro', value: '38 cm' });
    expect(
      await measurements.add(maria.id, { key: 'ômbro', value: '39 cm' }),
    ).toEqual({ ok: false, error: 'key-taken' });
    expect(await measurements.listFor(maria.id)).toMatchObject([
      { key: 'busto', value: '92 cm' },
      { key: 'Cintura', value: '72 cm' },
      { key: 'Ômbro', value: '38 cm' },
    ]);
  });
});

describe('search by name', () => {
  const customers: Customer[] = [
    { id: 1, name: 'Maria Souza', phone: null, description: null },
    { id: 2, name: 'Érica Lima', phone: null, description: null },
    { id: 3, name: 'Ana Maria', phone: null, description: null },
  ];

  test('a part of the name finds only the matching customers, ignoring case', () => {
    expect(searchByName(customers, 'mar').map(c => c.id)).toEqual([1, 3]);
    expect(searchByName(customers, 'ÉRICA').map(c => c.id)).toEqual([2]);
    expect(searchByName(customers, 'joana')).toEqual([]);
  });

  test('an empty search shows everyone', () => {
    expect(searchByName(customers, '  ')).toEqual(customers);
  });
});
