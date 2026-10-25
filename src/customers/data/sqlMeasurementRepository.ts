import type { Database, Row } from '../../database';
import {
  isSameKey,
  validateMeasurement,
  type Measurement,
  type MeasurementRepository,
} from '../domain';
import { NOW } from './timestamps';

const COLUMNS = 'm.id, m.customer_id, m.key, m.value';
// Measurements are reached only through customers that were not deleted.
const OF_ACTIVE_CUSTOMERS =
  'measurement m JOIN customer c ON c.id = m.customer_id AND c.deleted_at IS NULL';

export function createMeasurementRepository(
  db: Database,
): MeasurementRepository {
  const get = async (id: number): Promise<Measurement | null> => {
    const [row] = await db.query(
      `SELECT ${COLUMNS} FROM ${OF_ACTIVE_CUSTOMERS} WHERE m.id = ?`,
      [id],
    );
    return row ? toMeasurement(row) : null;
  };

  // Checked before writing so a repeated key is an answer for the user, not a
  // constraint error. Compared here because SQLite's NOCASE index (the guard in
  // the table) only ignores the case of ASCII letters, not of "Ô" or "É".
  const isKeyTaken = async (
    customerId: number,
    key: string,
    exceptId?: number,
  ) => {
    const rows = await db.query(
      'SELECT key FROM measurement WHERE customer_id = ? AND id <> ?',
      [customerId, exceptId ?? -1],
    );
    return rows.some(row => isSameKey(String(row.key), key));
  };

  return {
    async listFor(customerId) {
      const rows = await db.query(
        `SELECT ${COLUMNS} FROM ${OF_ACTIVE_CUSTOMERS} WHERE m.customer_id = ? ORDER BY m.key COLLATE NOCASE`,
        [customerId],
      );
      return rows.map(toMeasurement);
    },

    get,

    async add(customerId, input) {
      const valid = validateMeasurement(input);
      if (!valid.ok) {
        return valid;
      }
      const { key, value } = valid.measurement;
      if (await isKeyTaken(customerId, key)) {
        return { ok: false, error: 'key-taken' };
      }
      const result = await db.execute(
        'INSERT INTO measurement (customer_id, key, value) VALUES (?, ?, ?)',
        [customerId, key, value],
      );
      return {
        ok: true,
        measurement: { id: Number(result.insertId), customerId, key, value },
      };
    },

    async update(id, input) {
      const valid = validateMeasurement(input);
      if (!valid.ok) {
        return valid;
      }
      const current = await get(id);
      if (!current) {
        return { ok: false, error: 'not-found' };
      }
      const { key, value } = valid.measurement;
      if (await isKeyTaken(current.customerId, key, id)) {
        return { ok: false, error: 'key-taken' };
      }
      await db.execute(
        `UPDATE measurement SET key = ?, value = ?, updated_at = ${NOW} WHERE id = ?`,
        [key, value, id],
      );
      return { ok: true, measurement: { ...current, key, value } };
    },

    async remove(id) {
      await db.execute('DELETE FROM measurement WHERE id = ?', [id]);
    },
  };
}

function toMeasurement(row: Row): Measurement {
  return {
    id: Number(row.id),
    customerId: Number(row.customer_id),
    key: String(row.key),
    value: String(row.value),
  };
}
