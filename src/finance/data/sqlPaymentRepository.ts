import { SQL_NOW as NOW, type Database, type Row } from '../../database';
import {
  validatePayment,
  type Payment,
  type PaymentRepository,
} from '../domain';

const COLUMNS = 'id, customer_id, amount_cents, date';

export function createPaymentRepository(db: Database): PaymentRepository {
  const get = async (id: number): Promise<Payment | null> => {
    const [row] = await db.query(
      `SELECT ${COLUMNS} FROM payment WHERE id = ?`,
      [id],
    );
    return row ? toPayment(row) : null;
  };

  return {
    async listForCustomer(customerId) {
      const rows = await db.query(
        `SELECT ${COLUMNS} FROM payment WHERE customer_id = ?
         ORDER BY date DESC, id DESC`,
        [customerId],
      );
      return rows.map(toPayment);
    },

    get,

    async create(customerId, input) {
      const valid = validatePayment(input);
      if (!valid.ok) {
        return valid;
      }
      const { amountCents, date } = valid.payment;
      const result = await db.execute(
        'INSERT INTO payment (customer_id, amount_cents, date) VALUES (?, ?, ?)',
        [customerId, amountCents, date],
      );
      return {
        ok: true,
        payment: { id: Number(result.insertId), customerId, ...valid.payment },
      };
    },

    async update(id, input) {
      const valid = validatePayment(input);
      if (!valid.ok) {
        return valid;
      }
      const current = await get(id);
      if (!current) {
        return { ok: false, error: 'not-found' };
      }
      const { amountCents, date } = valid.payment;
      await db.execute(
        `UPDATE payment SET amount_cents = ?, date = ?, updated_at = ${NOW} WHERE id = ?`,
        [amountCents, date, id],
      );
      return { ok: true, payment: { ...current, ...valid.payment } };
    },

    async remove(id) {
      await db.execute('DELETE FROM payment WHERE id = ?', [id]);
    },

    async totalsFor(customerId) {
      // SQLite sums INTEGER columns as integers, so cents never become floats.
      const [row] = await db.query(
        `SELECT
           (SELECT COALESCE(SUM(amount_cents), 0) FROM job WHERE customer_id = ?)
           + (SELECT COALESCE(SUM(amount_cents), 0) FROM product_sale WHERE customer_id = ?)
             AS charged,
           (SELECT COALESCE(SUM(amount_cents), 0) FROM payment WHERE customer_id = ?)
             AS paid`,
        [customerId, customerId, customerId],
      );
      return { chargedCents: Number(row.charged), paidCents: Number(row.paid) };
    },

    async listAmountsDue() {
      const rows = await db.query(
        `SELECT id, name, due FROM (
           SELECT c.id, c.name,
             (SELECT COALESCE(SUM(amount_cents), 0) FROM job WHERE customer_id = c.id)
             + (SELECT COALESCE(SUM(amount_cents), 0) FROM product_sale WHERE customer_id = c.id)
             - (SELECT COALESCE(SUM(amount_cents), 0) FROM payment WHERE customer_id = c.id)
               AS due
           FROM customer c
           WHERE c.deleted_at IS NULL
         )
         WHERE due > 0
         ORDER BY due DESC, name`,
      );
      return rows.map(row => ({
        customerId: Number(row.id),
        customerName: String(row.name),
        amountDueCents: Number(row.due),
      }));
    },
  };
}

function toPayment(row: Row): Payment {
  return {
    id: Number(row.id),
    customerId: Number(row.customer_id),
    amountCents: Number(row.amount_cents),
    date: String(row.date),
  };
}
