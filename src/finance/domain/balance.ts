import { sumCents, type Cents } from '../../money';

/** What a customer was charged (jobs + products sold) and has paid. */
export type CustomerTotals = {
  chargedCents: Cents;
  paidCents: Cents;
};

/** What one customer still owes, for the list of open debts. */
export type AmountDue = {
  customerId: number;
  customerName: string;
  amountDueCents: Cents;
};

export type CustomerBalance = {
  totalPaid: Cents;
  /** Charges minus payments, never below zero. */
  amountDue: Cents;
  /** What the customer paid beyond the charges. */
  credit: Cents;
};

export function customerBalance({
  chargedCents,
  paidCents,
}: CustomerTotals): CustomerBalance {
  const remainder = chargedCents - paidCents;
  return {
    totalPaid: paidCents,
    amountDue: Math.max(remainder, 0),
    credit: Math.max(-remainder, 0),
  };
}

/**
 * Whether paying `amountCents` leaves the total paid above the charges.
 * When editing, `replacedCents` is the payment's old amount, left out of the sum.
 */
export function exceedsAmountDue(
  { chargedCents, paidCents }: CustomerTotals,
  amountCents: Cents,
  replacedCents: Cents = 0,
): boolean {
  return paidCents - replacedCents + amountCents > chargedCents;
}

/** Everything customers still owe, summed in integer cents. */
export function totalAmountDue(amounts: AmountDue[]): Cents {
  return sumCents(amounts.map(({ amountDueCents }) => amountDueCents));
}
