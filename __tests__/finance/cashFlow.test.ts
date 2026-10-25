import {
  formatBusinessMonth,
  monthOf,
  nextMonth,
  previousMonth,
} from '../../src/calendar';
import { createCustomerRepository } from '../../src/customers';
import { initializeDatabase, type Database } from '../../src/database';
import {
  cashFlowSummary,
  createCashFlowRepository,
  createExpenseRepository,
  createPaymentRepository,
  type Expense,
} from '../../src/finance';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';

async function setup() {
  const db = createNodeSqliteDatabase();
  await initializeDatabase(db);
  const customers = createCustomerRepository(db);
  const created = await customers.create({ name: 'Maria' });
  if (!created.ok) {
    throw new Error(created.error);
  }
  return {
    db,
    customers,
    maria: created.customer,
    payments: createPaymentRepository(db),
    expenses: createExpenseRepository(db),
    cashFlow: createCashFlowRepository(db),
  };
}

async function count(db: Database): Promise<number> {
  const [row] = await db.query('SELECT COUNT(*) AS total FROM expense');
  return Number(row.total);
}

function expense(
  result: { ok: true; expense: Expense } | { ok: false; error: string },
): Expense {
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.expense;
}

describe('business month', () => {
  test('a date belongs to its month, shown in Portuguese', () => {
    expect(monthOf('2026-10-31')).toBe('2026-10');
    expect(formatBusinessMonth('2026-10')).toBe('Outubro de 2026');
  });

  test('previous and next month cross the year', () => {
    expect(nextMonth('2026-12')).toBe('2027-01');
    expect(previousMonth('2027-01')).toBe('2026-12');
    expect(nextMonth('2026-10')).toBe('2026-11');
  });
});

describe('expenses', () => {
  test('a valid expense stores its category and the amount in cents', async () => {
    const { db, expenses } = await setup();

    const saved = expense(
      await expenses.create({
        description: ' Linha e botões ',
        category: 'materials',
        amount: '35,00',
        date: '2026-10-24',
      }),
    );

    expect(saved).toEqual({
      id: expect.any(Number),
      description: 'Linha e botões',
      category: 'materials',
      amountCents: 3500,
      date: '2026-10-24',
    });
    const [row] = await db.query(
      'SELECT category, typeof(amount_cents) AS type FROM expense',
    );
    expect(row).toEqual({ category: 'materials', type: 'integer' });
  });

  test.each([
    [{ category: null }, 'category-required'],
    [{ category: 'fees' }, 'category-required'],
    [{ description: '  ' }, 'description-required'],
    [{ amount: 'abc' }, 'amount-invalid'],
    [{ amount: '0' }, 'amount-invalid'],
  ] as const)(
    'an invalid expense is refused and nothing is saved: %o',
    async (change, error) => {
      const { db, expenses } = await setup();

      expect(
        await expenses.create({
          description: 'Linha',
          category: 'materials',
          amount: '35',
          date: '2026-10-24',
          ...change,
        }),
      ).toEqual({ ok: false, error });
      expect(await count(db)).toBe(0);
    },
  );
});

describe('cash flow', () => {
  test("a month sums only its own payments and expenses, including deleted customers' payments", async () => {
    const { customers, maria, payments, expenses, cashFlow } = await setup();
    for (const date of [
      '2026-09-30',
      '2026-10-01',
      '2026-10-31',
      '2026-11-01',
    ]) {
      await payments.create(maria.id, { amount: '100', date });
      await expenses.create({
        description: `Linha ${date}`,
        category: 'materials',
        amount: '30',
        date,
      });
    }
    await customers.remove(maria.id);

    const totals = await cashFlow.totalsFor('2026-10');

    expect(totals).toEqual({ incomeCents: 20000, expensesCents: 6000 });
    expect(cashFlowSummary(totals)).toEqual({
      incomeCents: 20000,
      expensesCents: 6000,
      balanceCents: 14000,
    });
    expect(
      (await expenses.listForMonth('2026-10')).map(item => item.date),
    ).toEqual(['2026-10-01', '2026-10-31']);
  });

  test('the balance is negative when expenses exceed income', async () => {
    const { maria, payments, expenses, cashFlow } = await setup();
    await payments.create(maria.id, { amount: '20', date: '2026-12-10' });
    await expenses.create({
      description: 'Imposto MEI',
      category: 'tax',
      amount: '75,90',
      date: '2026-12-20',
    });

    expect(cashFlowSummary(await cashFlow.totalsFor('2026-12'))).toEqual({
      incomeCents: 2000,
      expensesCents: 7590,
      balanceCents: -5590,
    });
  });

  test('editing and deleting an expense change the month it counts in', async () => {
    const { expenses, cashFlow } = await setup();
    const saved = expense(
      await expenses.create({
        description: 'Imposto MEI',
        category: 'tax',
        amount: '12',
        date: '2026-10-31',
      }),
    );

    expect(
      await expenses.update(saved.id, {
        description: 'Imposto MEI',
        category: 'tax',
        amount: '15',
        date: '2026-11-01',
      }),
    ).toEqual({
      ok: true,
      expense: { ...saved, amountCents: 1500, date: '2026-11-01' },
    });
    expect(await cashFlow.totalsFor('2026-10')).toEqual({
      incomeCents: 0,
      expensesCents: 0,
    });
    expect(await expenses.listForMonth('2026-11')).toHaveLength(1);

    await expenses.remove(saved.id);

    expect(await expenses.listForMonth('2026-11')).toEqual([]);
  });
});
