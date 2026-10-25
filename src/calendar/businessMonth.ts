import type { BusinessDate } from './businessDate';

/** A calendar month of business dates, stored as "YYYY-MM". */
export type BusinessMonth = string;

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function monthOf(date: BusinessDate): BusinessMonth {
  return date.slice(0, 7);
}

export function previousMonth(month: BusinessMonth): BusinessMonth {
  return shiftMonth(month, -1);
}

export function nextMonth(month: BusinessMonth): BusinessMonth {
  return shiftMonth(month, 1);
}

/** "Outubro de 2026". */
export function formatBusinessMonth(month: BusinessMonth): string {
  const [year, index] = parts(month);
  return `${MONTH_NAMES[index]} de ${year}`;
}

function shiftMonth(month: BusinessMonth, offset: number): BusinessMonth {
  const [year, index] = parts(month);
  const total = year * 12 + index + offset;
  const shiftedYear = Math.floor(total / 12);
  const shiftedMonth = String((total % 12) + 1).padStart(2, '0');
  return `${shiftedYear}-${shiftedMonth}`;
}

/** Year and zero-based month index. */
function parts(month: BusinessMonth): [number, number] {
  return [Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1];
}
