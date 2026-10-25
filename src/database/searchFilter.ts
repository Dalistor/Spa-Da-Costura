import type { ListSearch } from '../search';
import type { SqlValue } from './Database';

type Columns = {
  amount: string;
  date: string;
  /** Columns matched by typed text; a list without text matches no text. */
  text?: string[];
};

/** The WHERE condition (and its parameters) that keeps the rows a search asks for. */
export function searchFilter(
  search: ListSearch,
  columns: Columns,
): { sql: string; params: SqlValue[] } {
  switch (search.kind) {
    case 'all':
      return { sql: '1 = 1', params: [] };
    case 'amount':
      return { sql: `${columns.amount} = ?`, params: [search.cents] };
    case 'date':
      return { sql: `${columns.date} = ?`, params: [search.date] };
    case 'dayOfYear':
      return { sql: `substr(${columns.date}, 6, 5) = ?`, params: [search.monthDay] };
    case 'month':
      return { sql: `substr(${columns.date}, 1, 7) = ?`, params: [search.month] };
    case 'text': {
      const text = columns.text ?? [];
      if (text.length === 0) {
        return { sql: '1 = 0', params: [] };
      }
      const pattern = `%${search.text.replace(/[\\%_]/g, match => `\\${match}`)}%`;
      return {
        sql: `(${text.map(column => `${column} LIKE ? ESCAPE '\\'`).join(' OR ')})`,
        params: text.map(() => pattern),
      };
    }
  }
}
