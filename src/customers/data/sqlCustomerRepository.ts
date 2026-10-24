import type { Database, Row } from '../../database';
import {
  compareByName,
  validateCustomer,
  type Customer,
  type CustomerRepository,
} from '../domain';
import { NOW } from './timestamps';

const COLUMNS = 'id, name, phone, description';
const ACTIVE = 'deleted_at IS NULL';

export function createCustomerRepository(db: Database): CustomerRepository {
  const get = async (id: number): Promise<Customer | null> => {
    const [row] = await db.query(
      `SELECT ${COLUMNS} FROM customer WHERE id = ? AND ${ACTIVE}`,
      [id],
    );
    return row ? toCustomer(row) : null;
  };

  return {
    async list() {
      const rows = await db.query(
        `SELECT ${COLUMNS} FROM customer WHERE ${ACTIVE}`,
      );
      return rows.map(toCustomer).sort(compareByName);
    },

    get,

    async create(input) {
      const valid = validateCustomer(input);
      if (!valid.ok) {
        return valid;
      }
      const { name, phone, description } = valid.customer;
      const result = await db.execute(
        'INSERT INTO customer (name, phone, description) VALUES (?, ?, ?)',
        [name, phone, description],
      );
      return {
        ok: true,
        customer: { id: Number(result.insertId), ...valid.customer },
      };
    },

    async update(id, input) {
      const valid = validateCustomer(input);
      if (!valid.ok) {
        return valid;
      }
      const { name, phone, description } = valid.customer;
      const result = await db.execute(
        `UPDATE customer SET name = ?, phone = ?, description = ?, updated_at = ${NOW}
         WHERE id = ? AND ${ACTIVE}`,
        [name, phone, description, id],
      );
      if (result.changes === 0) {
        return { ok: false, error: 'not-found' };
      }
      return { ok: true, customer: { id, ...valid.customer } };
    },

    async remove(id) {
      const result = await db.execute(
        `UPDATE customer SET deleted_at = ${NOW}, updated_at = ${NOW} WHERE id = ? AND ${ACTIVE}`,
        [id],
      );
      return result.changes > 0;
    },
  };
}

function toCustomer(row: Row): Customer {
  return {
    id: Number(row.id),
    name: String(row.name),
    phone: row.phone === null ? null : String(row.phone),
    description: row.description === null ? null : String(row.description),
  };
}
