/**
 * Money is always an integer number of cents (centavos), never a float.
 */
export type Cents = number;

export type ParseCentsError = 'empty' | 'invalid' | 'negative';

export type ParseCentsResult =
  | { ok: true; cents: Cents }
  | { ok: false; error: ParseCentsError };

const CURRENCY_PREFIX = /^R\$\s*/i;
// Integer part with optional "." thousands groups, then optional "," decimal part.
const BRAZILIAN_AMOUNT = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/;
// Android decimal keypads may type "." as the decimal separator: "12.50".
const DOT_DECIMAL_AMOUNT = /^(\d+)\.(\d{1,2})$/;

export function parseCents(text: string): ParseCentsResult {
  const trimmed = text.trim().replace(CURRENCY_PREFIX, '');
  if (trimmed === '') {
    return { ok: false, error: 'empty' };
  }
  if (trimmed.startsWith('-')) {
    return parseCents(trimmed.slice(1)).ok
      ? { ok: false, error: 'negative' }
      : { ok: false, error: 'invalid' };
  }

  const match =
    DOT_DECIMAL_AMOUNT.exec(trimmed) ?? BRAZILIAN_AMOUNT.exec(trimmed);
  if (!match) {
    return { ok: false, error: 'invalid' };
  }
  const reais = Number(match[1].replace(/\./g, ''));
  const fraction = Number((match[2] ?? '').padEnd(2, '0'));
  const cents = reais * 100 + fraction;
  if (!Number.isSafeInteger(cents)) {
    return { ok: false, error: 'invalid' };
  }
  return { ok: true, cents };
}

export function formatCents(cents: Cents): string {
  assertCents(cents);
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  const reais = Math.floor(absolute / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const fraction = (absolute % 100).toString().padStart(2, '0');
  return `${sign}R$ ${reais},${fraction}`;
}

export function sumCents(amounts: readonly Cents[]): Cents {
  return amounts.reduce((total, amount) => {
    assertCents(amount);
    return total + amount;
  }, 0);
}

function assertCents(value: number): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`Amount must be an integer number of cents: ${value}`);
  }
}
