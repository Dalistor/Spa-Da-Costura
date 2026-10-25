import {
  SQL_NOW as NOW,
  searchFilter,
  type Database,
  type Row,
} from '../../database';
import {
  validateJob,
  type Job,
  type JobListItem,
  type JobRepository,
  type JobStatus,
} from '../domain';

const COLUMNS =
  'j.id, j.customer_id, j.description, j.amount_cents, j.status, j.delivery_date';
const NEAREST_FIRST = 'ORDER BY j.delivery_date, j.id';

export function createJobRepository(db: Database): JobRepository {
  const get = async (id: number): Promise<Job | null> => {
    const [row] = await db.query(
      `SELECT ${COLUMNS} FROM job j WHERE j.id = ?`,
      [id],
    );
    return row ? toJob(row) : null;
  };

  return {
    async listAll() {
      // Jobs of deleted customers stay in the table but leave the tab (SRV-05).
      const rows = await db.query(
        `SELECT ${COLUMNS}, c.name AS customer_name
         FROM job j JOIN customer c ON c.id = j.customer_id AND c.deleted_at IS NULL
         ${NEAREST_FIRST}`,
      );
      return rows.map(toListItem);
    },

    async search(search, { offset, limit }) {
      const filter = searchFilter(search, {
        amount: 'j.amount_cents',
        date: 'j.delivery_date',
        text: ['j.description', 'c.name'],
      });
      const from = `FROM job j
         JOIN customer c ON c.id = j.customer_id AND c.deleted_at IS NULL
         WHERE ${filter.sql}`;
      const [counted] = await db.query(
        `SELECT COUNT(*) AS total ${from}`,
        filter.params,
      );
      const rows = await db.query(
        `SELECT ${COLUMNS}, c.name AS customer_name ${from}
         ${NEAREST_FIRST} LIMIT ? OFFSET ?`,
        [...filter.params, limit, offset],
      );
      return { items: rows.map(toListItem), total: Number(counted.total) };
    },

    async searchForCustomer(customerId, search, { offset, limit }) {
      const filter = searchFilter(search, {
        amount: 'j.amount_cents',
        date: 'j.delivery_date',
        text: ['j.description'],
      });
      const where = `WHERE j.customer_id = ? AND ${filter.sql}`;
      const params = [customerId, ...filter.params];
      const [counted] = await db.query(
        `SELECT COUNT(*) AS total FROM job j ${where}`,
        params,
      );
      const rows = await db.query(
        `SELECT ${COLUMNS} FROM job j ${where} ${NEAREST_FIRST} LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      );
      return { items: rows.map(toJob), total: Number(counted.total) };
    },

    async listForCustomer(customerId) {
      const rows = await db.query(
        `SELECT ${COLUMNS} FROM job j WHERE j.customer_id = ? ${NEAREST_FIRST}`,
        [customerId],
      );
      return rows.map(toJob);
    },

    get,

    async create(customerId, input) {
      const valid = validateJob(input);
      if (!valid.ok) {
        return valid;
      }
      const { description, amountCents, deliveryDate } = valid.job;
      const result = await db.execute(
        'INSERT INTO job (customer_id, description, amount_cents, delivery_date) VALUES (?, ?, ?, ?)',
        [customerId, description, amountCents, deliveryDate],
      );
      return {
        ok: true,
        job: {
          id: Number(result.insertId),
          customerId,
          status: 'pending',
          ...valid.job,
        },
      };
    },

    async update(id, input) {
      const valid = validateJob(input);
      if (!valid.ok) {
        return valid;
      }
      const { description, amountCents, deliveryDate } = valid.job;
      const result = await db.execute(
        `UPDATE job SET description = ?, amount_cents = ?, delivery_date = ?, updated_at = ${NOW}
         WHERE id = ?`,
        [description, amountCents, deliveryDate, id],
      );
      const job = result.changes > 0 ? await get(id) : null;
      return job ? { ok: true, job } : { ok: false, error: 'not-found' };
    },

    async setStatus(id, status) {
      await db.execute(
        `UPDATE job SET status = ?, updated_at = ${NOW} WHERE id = ?`,
        [status, id],
      );
    },

    async remove(id) {
      await db.execute('DELETE FROM job WHERE id = ?', [id]);
    },
  };
}

function toJob(row: Row): Job {
  return {
    id: Number(row.id),
    customerId: Number(row.customer_id),
    description: String(row.description),
    amountCents: Number(row.amount_cents),
    status: String(row.status) as JobStatus,
    deliveryDate: String(row.delivery_date),
  };
}

function toListItem(row: Row): JobListItem {
  return { ...toJob(row), customerName: String(row.customer_name) };
}
