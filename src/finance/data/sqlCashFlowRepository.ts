import type { Database } from '../../database';
import type { CashFlowRepository } from '../domain';
import { monthRange } from './monthRange';

export function createCashFlowRepository(db: Database): CashFlowRepository {
  return {
    async totalsFor(month) {
      const range = monthRange(month);
      // Payments are not joined to customer, so deleted customers still count.
      const [row] = await db.query(
        `SELECT
           (SELECT COALESCE(SUM(amount_cents), 0) FROM payment WHERE date BETWEEN ? AND ?)
             AS income,
           (SELECT COALESCE(SUM(amount_cents), 0) FROM expense WHERE date BETWEEN ? AND ?)
             AS expenses`,
        [...range, ...range],
      );
      return {
        incomeCents: Number(row.income),
        expensesCents: Number(row.expenses),
      };
    },
  };
}
