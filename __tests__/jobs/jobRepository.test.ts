import { formatBusinessDate, todayLocal } from '../../src/calendar';
import { createCustomerRepository } from '../../src/customers';
import { initializeDatabase, type Database } from '../../src/database';
import { createJobRepository, type Job } from '../../src/jobs';
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
  return { db, customers, jobs: createJobRepository(db), maria, ana };
}

async function count(db: Database): Promise<number> {
  const [row] = await db.query('SELECT COUNT(*) AS total FROM job');
  return Number(row.total);
}

function saved(
  result: { ok: true; job: Job } | { ok: false; error: string },
): Job {
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.job;
}

describe('jobs', () => {
  test('a new job stores the amount in cents and starts as pending', async () => {
    const { db, jobs, maria } = await setup();

    const job = saved(
      await jobs.create(maria.id, {
        description: ' Barra da calça ',
        amount: '1.234,50',
        deliveryDate: '2026-10-30',
      }),
    );

    expect(job).toEqual({
      id: expect.any(Number),
      customerId: maria.id,
      description: 'Barra da calça',
      amountCents: 123450,
      status: 'pending',
      deliveryDate: '2026-10-30',
    });
    const [row] = await db.query(
      'SELECT amount_cents, typeof(amount_cents) AS type FROM job',
    );
    expect(row).toEqual({ amount_cents: 123450, type: 'integer' });
  });

  test.each([
    [
      { description: '  ', amount: '10,00', deliveryDate: '2026-10-30' },
      'description-required',
    ],
    [
      { description: 'Barra', amount: 'abc', deliveryDate: '2026-10-30' },
      'amount-invalid',
    ],
    [
      { description: 'Barra', amount: '', deliveryDate: '2026-10-30' },
      'amount-invalid',
    ],
    [
      { description: 'Barra', amount: '-5', deliveryDate: '2026-10-30' },
      'amount-invalid',
    ],
    [
      { description: 'Barra', amount: '5', deliveryDate: '30/10/2026' },
      'date-invalid',
    ],
  ])(
    'an invalid job is refused and nothing is saved: %o',
    async (input, error) => {
      const { db, jobs, maria } = await setup();

      expect(await jobs.create(maria.id, input)).toEqual({ ok: false, error });
      expect(await count(db)).toBe(0);
    },
  );

  test('a free job (zero) is accepted', async () => {
    const { jobs, maria } = await setup();

    const job = saved(
      await jobs.create(maria.id, {
        description: 'Ajuste',
        amount: '0',
        deliveryDate: '2026-10-30',
      }),
    );

    expect(job.amountCents).toBe(0);
  });

  test('editing, changing status and deleting affect only the chosen job', async () => {
    const { jobs, maria, ana } = await setup();
    const hem = saved(
      await jobs.create(maria.id, {
        description: 'Barra',
        amount: '25',
        deliveryDate: '2026-10-30',
      }),
    );
    const zip = saved(
      await jobs.create(maria.id, {
        description: 'Zíper',
        amount: '40',
        deliveryDate: '2026-10-31',
      }),
    );
    const other = saved(
      await jobs.create(ana.id, {
        description: 'Bainha',
        amount: '20',
        deliveryDate: '2026-11-01',
      }),
    );

    expect(
      await jobs.update(hem.id, {
        description: 'Barra da calça',
        amount: '30,00',
        deliveryDate: '2026-11-02',
      }),
    ).toMatchObject({ ok: true });
    expect(
      await jobs.update(hem.id, {
        description: '',
        amount: '30',
        deliveryDate: '2026-11-02',
      }),
    ).toEqual({
      ok: false,
      error: 'description-required',
    });
    await jobs.setStatus(zip.id, 'ready');
    await jobs.remove(other.id);

    expect(await jobs.listForCustomer(maria.id)).toEqual([
      { ...zip, status: 'ready' },
      {
        ...hem,
        description: 'Barra da calça',
        amountCents: 3000,
        deliveryDate: '2026-11-02',
      },
    ]);
    expect(await jobs.listForCustomer(ana.id)).toEqual([]);
    await jobs.setStatus(zip.id, 'delivered');
    expect(await jobs.get(zip.id)).toMatchObject({ status: 'delivered' });
  });

  test('the jobs tab lists every job by delivery date, without deleted customers', async () => {
    const { db, customers, jobs, maria, ana } = await setup();
    await jobs.create(maria.id, {
      description: 'Barra',
      amount: '25',
      deliveryDate: '2026-11-05',
    });
    await jobs.create(ana.id, {
      description: 'Bainha',
      amount: '20',
      deliveryDate: '2026-10-28',
    });
    await jobs.create(maria.id, {
      description: 'Zíper',
      amount: '40',
      deliveryDate: '2026-10-29',
    });

    expect(
      (await jobs.listAll()).map(job => [job.description, job.customerName]),
    ).toEqual([
      ['Bainha', 'Ana'],
      ['Zíper', 'Maria'],
      ['Barra', 'Maria'],
    ]);

    await customers.remove(ana.id);

    expect((await jobs.listAll()).map(job => job.description)).toEqual([
      'Zíper',
      'Barra',
    ]);
    expect(await count(db)).toBe(3);
  });
});

describe('business dates', () => {
  test('today is the local calendar date, also late at night', () => {
    expect(todayLocal(new Date(2026, 9, 24, 23, 59))).toBe('2026-10-24');
    expect(todayLocal(new Date(2026, 0, 5, 0, 1))).toBe('2026-01-05');
  });

  test('dates are shown as day/month/year', () => {
    expect(formatBusinessDate('2026-10-04')).toBe('04/10/2026');
  });
});
