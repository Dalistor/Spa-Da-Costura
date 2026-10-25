/**
 * A business date is a calendar day in the seamstress's local time,
 * stored as "YYYY-MM-DD" text (never derived from a UTC timestamp).
 */
export type BusinessDate = string;

const BUSINESS_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function todayLocal(now: Date = new Date()): BusinessDate {
  return toBusinessDate(now);
}

export function toBusinessDate(date: Date): BusinessDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Midday local time, so the date survives any time-zone shift of a picker. */
export function fromBusinessDate(date: BusinessDate): Date {
  const [, year, month, day] = BUSINESS_DATE.exec(date) ?? [];
  return new Date(Number(year), Number(month) - 1, Number(day), 12);
}

export function isBusinessDate(text: string): boolean {
  const match = BUSINESS_DATE.exec(text);
  return match !== null && toBusinessDate(fromBusinessDate(text)) === text;
}

export function formatBusinessDate(date: BusinessDate): string {
  const [, year, month, day] = BUSINESS_DATE.exec(date) ?? [];
  return `${day}/${month}/${year}`;
}
