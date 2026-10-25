import { SQL_NOW as NOW, type Database, type Row } from '../../database';
import {
  compareByName,
  validateProduct,
  type Product,
  type ProductRepository,
} from '../domain';

const COLUMNS = 'id, name, price_cents';

export function createProductRepository(db: Database): ProductRepository {
  return {
    async list() {
      const rows = await db.query(`SELECT ${COLUMNS} FROM product`);
      return rows.map(toProduct).sort(compareByName);
    },

    async get(id) {
      const [row] = await db.query(
        `SELECT ${COLUMNS} FROM product WHERE id = ?`,
        [id],
      );
      return row ? toProduct(row) : null;
    },

    async create(input) {
      const valid = validateProduct(input);
      if (!valid.ok) {
        return valid;
      }
      const { name, priceCents } = valid.product;
      const result = await db.execute(
        'INSERT INTO product (name, price_cents) VALUES (?, ?)',
        [name, priceCents],
      );
      return {
        ok: true,
        product: { id: Number(result.insertId), ...valid.product },
      };
    },

    async update(id, input) {
      const valid = validateProduct(input);
      if (!valid.ok) {
        return valid;
      }
      const { name, priceCents } = valid.product;
      const result = await db.execute(
        `UPDATE product SET name = ?, price_cents = ?, updated_at = ${NOW} WHERE id = ?`,
        [name, priceCents, id],
      );
      return result.changes > 0
        ? { ok: true, product: { id, ...valid.product } }
        : { ok: false, error: 'not-found' };
    },

    async remove(id) {
      // The schema sets product_id to NULL on its sales, keeping name and amount.
      await db.execute('DELETE FROM product WHERE id = ?', [id]);
    },
  };
}

function toProduct(row: Row): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    priceCents: Number(row.price_cents),
  };
}
