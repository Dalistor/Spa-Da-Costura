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

  test('deleted customers are hidden from list and lookup', async () => {
    const db = await openDatabase();
    const customers = createCustomerRepository(db);
    const gone = await createCustomer(db, 'Excluída');
    await createCustomer(db, 'Ativa');
    await db.execute(
      "UPDATE customer SET deleted_at = '2026-10-24T00:00:00Z' WHERE id = ?",
      [gone.id],
    );

    expect((await customers.list()).map(c => c.name)).toEqual(['Ativa']);
    expect(await customers.get(gone.id)).toBeNull();
    expect(await customers.update(gone.id, { name: 'Volta' })).toEqual({
      ok: false,
      error: 'not-found',
    });
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

  test('a repeated key in the same customer is refused, also when editing', async () => {
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
      await measurements.add(maria.id, { key: 'Cintura ', value: '70 cm' }),
    ).toEqual({
      ok: false,
      error: 'key-taken',
    });
    expect(
      await measurements.update(bust.measurement.id, {
        key: 'Cintura',
        value: '90 cm',
      }),
    ).toEqual({
      ok: false,
      error: 'key-taken',
    });
    expect(
      await measurements.update(bust.measurement.id, {
        key: 'Busto',
        value: '92 cm',
      }),
    ).toMatchObject({
      ok: true,
    });
    expect(await measurements.listFor(maria.id)).toMatchObject([
      { key: 'Busto', value: '92 cm' },
      { key: 'Cintura', value: '72 cm' },
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
