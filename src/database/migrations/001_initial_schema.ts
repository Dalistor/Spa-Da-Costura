import type { Migration } from '../migrate';

const NOW = "(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))";
const TIMESTAMPS = `created_at TEXT NOT NULL DEFAULT ${NOW},
  updated_at TEXT NOT NULL DEFAULT ${NOW}`;

const isDate = (column: string) =>
  `CHECK (${column} GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]')`;
const isText = (column: string) => `CHECK (trim(${column}) <> '')`;
const isCents = (column: string, comparison: '>= 0' | '> 0') =>
  `CHECK (typeof(${column}) = 'integer' AND ${column} ${comparison})`;

// Customers are soft deleted (deleted_at), so every reference to them is
// RESTRICT: a physical delete fails instead of erasing payments from cash flow.
export const initialSchema: Migration = {
  version: 1,
  statements: [
    `CREATE TABLE customer (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL ${isText('name')},
  phone TEXT,
  description TEXT,
  ${TIMESTAMPS},
  deleted_at TEXT
)`,
    'CREATE INDEX customer_name ON customer (name)',

    `CREATE TABLE measurement (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customer (id) ON DELETE RESTRICT,
  key TEXT NOT NULL ${isText('key')},
  value TEXT NOT NULL,
  ${TIMESTAMPS},
  UNIQUE (customer_id, key)
)`,

    `CREATE TABLE job (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customer (id) ON DELETE RESTRICT,
  description TEXT NOT NULL ${isText('description')},
  amount_cents INTEGER NOT NULL ${isCents('amount_cents', '>= 0')},
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'ready', 'delivered')),
  delivery_date TEXT NOT NULL ${isDate('delivery_date')},
  ${TIMESTAMPS}
)`,
    'CREATE INDEX job_customer ON job (customer_id)',

    `CREATE TABLE product (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL ${isText('name')},
  price_cents INTEGER NOT NULL ${isCents('price_cents', '>= 0')},
  ${TIMESTAMPS}
)`,

    `CREATE TABLE product_sale (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customer (id) ON DELETE RESTRICT,
  product_id INTEGER REFERENCES product (id) ON DELETE SET NULL,
  product_name TEXT NOT NULL ${isText('product_name')},
  amount_cents INTEGER NOT NULL ${isCents('amount_cents', '>= 0')},
  date TEXT NOT NULL ${isDate('date')},
  ${TIMESTAMPS}
)`,
    'CREATE INDEX product_sale_customer ON product_sale (customer_id)',
    'CREATE INDEX product_sale_product ON product_sale (product_id)',

    `CREATE TABLE payment (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customer (id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL ${isCents('amount_cents', '> 0')},
  date TEXT NOT NULL ${isDate('date')},
  ${TIMESTAMPS}
)`,
    'CREATE INDEX payment_customer ON payment (customer_id)',
    'CREATE INDEX payment_date ON payment (date)',

    `CREATE TABLE expense (
  id INTEGER PRIMARY KEY,
  description TEXT NOT NULL ${isText('description')},
  category TEXT NOT NULL CHECK (category IN ('fees', 'tax', 'materials')),
  amount_cents INTEGER NOT NULL ${isCents('amount_cents', '> 0')},
  date TEXT NOT NULL ${isDate('date')},
  ${TIMESTAMPS}
)`,
    'CREATE INDEX expense_date ON expense (date)',
  ],
};
