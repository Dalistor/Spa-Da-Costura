import type { Cents } from '../../money';

/** Payments received (entradas) and expenses (saídas) dated in one month. */
export type MonthTotals = {
  incomeCents: Cents;
  expensesCents: Cents;
};

export type CashFlowSummary = MonthTotals & {
  /** Income minus expenses; negative when the month spent more. */
  balanceCents: Cents;
};

export function cashFlowSummary(totals: MonthTotals): CashFlowSummary {
  return {
    ...totals,
    balanceCents: totals.incomeCents - totals.expensesCents,
  };
}
