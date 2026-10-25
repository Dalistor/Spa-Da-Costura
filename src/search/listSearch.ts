import { isBusinessDate, type BusinessDate } from '../calendar';
import { parseCents, type Cents } from '../money';

/** What the seamstress typed in a list's search box, read as an amount, a date or text. */
export type ListSearch =
  | { kind: 'all' }
  | { kind: 'amount'; cents: Cents }
  | { kind: 'date'; date: BusinessDate }
  /** "25/10": that day in any year, as "MM-DD". */
  | { kind: 'dayOfYear'; monthDay: string }
  /** "10/2026": the whole month, as "YYYY-MM". */
  | { kind: 'month'; month: string }
  | { kind: 'text'; text: string };

/** A slice of a long list: where it starts and how many rows it holds. */
export type PageRequest = { offset: number; limit: number };

/** One slice of the rows found, with how many were found in all. */
export type Page<T> = { items: T[]; total: number };

const FULL_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const DAY_AND_MONTH = /^(\d{1,2})\/(\d{1,2})$/;
const MONTH_AND_YEAR = /^(\d{1,2})\/(\d{4})$/;
// A leap year, so that 29/02 is accepted as a day that can exist.
const ANY_LEAP_YEAR = '2024';

const two = (digits: string) => digits.padStart(2, '0');

export function parseListSearch(typed: string): ListSearch {
  const text = typed.trim();
  if (text === '') {
    return { kind: 'all' };
  }

  const full = FULL_DATE.exec(text);
  if (full) {
    const date = `${full[3]}-${two(full[2])}-${two(full[1])}`;
    return isBusinessDate(date) ? { kind: 'date', date } : { kind: 'text', text };
  }
  const dayMonth = DAY_AND_MONTH.exec(text);
  if (dayMonth) {
    const monthDay = `${two(dayMonth[2])}-${two(dayMonth[1])}`;
    return isBusinessDate(`${ANY_LEAP_YEAR}-${monthDay}`)
      ? { kind: 'dayOfYear', monthDay }
      : { kind: 'text', text };
  }
  const monthYear = MONTH_AND_YEAR.exec(text);
  if (monthYear) {
    const month = Number(monthYear[1]);
    return month >= 1 && month <= 12
      ? { kind: 'month', month: `${monthYear[2]}-${two(monthYear[1])}` }
      : { kind: 'text', text };
  }

  const amount = parseCents(text);
  return amount.ok ? { kind: 'amount', cents: amount.cents } : { kind: 'text', text };
}

/** A page of rows that are already in memory, such as a filtered list. */
export function pageOf<T>(rows: T[], { offset, limit }: PageRequest): Page<T> {
  return { items: rows.slice(offset, offset + limit), total: rows.length };
}
