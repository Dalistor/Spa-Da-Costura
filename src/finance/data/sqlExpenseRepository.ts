import { SQL_NOW as NOW, type Database, type Row } from '../../database';
import {
  validateExpense,
  type Expense,
  type ExpenseCategory,
  type ExpenseRepository,
} from '../domain';
import { monthRange } from './monthRange';

const COLUMNS = 'id, description, category, amount_cents, date';

export function createExpenseRepository(db: Database): ExpenseRepository {
  return {
    async listForMonth(month) {
      const rows = await db.query(
        `SELECT ${COLUMNS} FROM expense WHERE date BETWEEN ? AND ?
         ORDER BY date, id`,
        monthRange(month),
      );
      return rows.map(toExpense);
    },

    async get(id) {
      const [row] = await db.query(
        `SELECT ${COLUMNS} FROM expense WHERE id = ?`,
        [id],
      );
      return row ? toExpense(row) : null;
    },

    async create(input) {
      const valid = validateExpense(input);
      if (!valid.ok) {
        return valid;
      }
      const { description, category, amountCents, date } = valid.expense;
      const result = await db.execute(
        `INSERT INTO expense (description, category, amount_cents, date)
         VALUES (?, ?, ?, ?)`,
        [description, category, amountCents, date],
      );
      return {
        ok: true,
        expense: { id: Number(result.insertId), ...valid.expense },
      };
    },

    async update(id, input) {
      const valid = validateExpense(input);
      if (!valid.ok) {
        return valid;
      }
      const { description, category, amountCents, date } = valid.expense;
      const result = await db.execute(
        `UPDATE expense
         SET description = ?, category = ?, amount_cents = ?, date = ?, updated_at = ${NOW}
         WHERE id = ?`,
        [description, category, amountCents, date, id],
      );
      return result.changes > 0
        ? { ok: true, expense: { id, ...valid.expense } }
        : { ok: false, error: 'not-found' };
    },

    async remove(id) {
      await db.execute('DELETE FROM expense WHERE id = ?', [id]);
    },
  };
}

function toExpense(row: Row): Expense {
  return {
    id: Number(row.id),
    description: String(row.description),
    category: String(row.category) as ExpenseCategory,
    amountCents: Number(row.amount_cents),
    date: String(row.date),
  };
}
