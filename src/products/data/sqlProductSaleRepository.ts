import { SQL_NOW as NOW, type Database, type Row } from '../../database';
import {
  validateProductSale,
  type ProductSale,
  type ProductSaleRepository,
} from '../domain';

const COLUMNS =
  'id, customer_id, product_id, product_name, amount_cents, date';

export function createProductSaleRepository(
  db: Database,
): ProductSaleRepository {
  const get = async (id: number): Promise<ProductSale | null> => {
    const [row] = await db.query(
      `SELECT ${COLUMNS} FROM product_sale WHERE id = ?`,
      [id],
    );
    return row ? toSale(row) : null;
  };

  const productName = async (productId: number | null) => {
    if (productId === null) {
      return null;
    }
    const [row] = await db.query('SELECT name FROM product WHERE id = ?', [
      productId,
    ]);
    return row ? String(row.name) : null;
  };

  return {
    async listForCustomer(customerId) {
      const rows = await db.query(
        `SELECT ${COLUMNS} FROM product_sale WHERE customer_id = ?
         ORDER BY date DESC, id DESC`,
        [customerId],
      );
      return rows.map(toSale);
    },

    get,

    async create(customerId, input) {
      const name = await productName(input.productId);
      if (name === null) {
        return { ok: false, error: 'product-required' };
      }
      const valid = validateProductSale(input);
      if (!valid.ok) {
        return valid;
      }
      const { amountCents, date } = valid.sale;
      const result = await db.execute(
        `INSERT INTO product_sale (customer_id, product_id, product_name, amount_cents, date)
         VALUES (?, ?, ?, ?, ?)`,
        [customerId, input.productId, name, amountCents, date],
      );
      return {
        ok: true,
        sale: {
          id: Number(result.insertId),
          customerId,
          productId: input.productId,
          productName: name,
          ...valid.sale,
        },
      };
    },

    async update(id, input) {
      const current = await get(id);
      if (!current) {
        return { ok: false, error: 'not-found' };
      }
      // Keeping the product keeps the name copied at sale time (PRD-01, PRD-02).
      const name =
        input.productId === current.productId
          ? current.productName
          : await productName(input.productId);
      if (name === null) {
        return { ok: false, error: 'product-required' };
      }
      const valid = validateProductSale(input);
      if (!valid.ok) {
        return valid;
      }
      const { amountCents, date } = valid.sale;
      await db.execute(
        `UPDATE product_sale
         SET product_id = ?, product_name = ?, amount_cents = ?, date = ?, updated_at = ${NOW}
         WHERE id = ?`,
        [input.productId, name, amountCents, date, id],
      );
      return {
        ok: true,
        sale: {
          ...current,
          productId: input.productId,
          productName: name,
          ...valid.sale,
        },
      };
    },

    async remove(id) {
      await db.execute('DELETE FROM product_sale WHERE id = ?', [id]);
    },
  };
}

function toSale(row: Row): ProductSale {
  return {
    id: Number(row.id),
    customerId: Number(row.customer_id),
    productId: row.product_id === null ? null : Number(row.product_id),
    productName: String(row.product_name),
    amountCents: Number(row.amount_cents),
    date: String(row.date),
  };
}
