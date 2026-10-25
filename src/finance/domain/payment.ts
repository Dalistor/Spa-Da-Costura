import { isBusinessDate, type BusinessDate } from '../../calendar';
import { parseCents, type Cents } from '../../money';

/** Money a customer paid; it belongs to the customer, not to a job or sale. */
export type Payment = {
  id: number;
  customerId: number;
  amountCents: Cents;
  date: BusinessDate;
};

/** What the seamstress types; the amount is text in reais ("40,00"). */
export type PaymentInput = {
  amount: string;
  date: BusinessDate;
};

export type PaymentError = 'amount-invalid' | 'date-invalid' | 'not-found';

export type SavePaymentResult =
  | { ok: true; payment: Payment }
  | { ok: false; error: PaymentError };

export type ValidPayment = Pick<Payment, 'amountCents' | 'date'>;

export function validatePayment(
  input: PaymentInput,
):
  | { ok: true; payment: ValidPayment }
  | { ok: false; error: Exclude<PaymentError, 'not-found'> } {
  const amount = parseCents(input.amount);
  if (!amount.ok || amount.cents === 0) {
    return { ok: false, error: 'amount-invalid' };
  }
  if (!isBusinessDate(input.date)) {
    return { ok: false, error: 'date-invalid' };
  }
  return { ok: true, payment: { amountCents: amount.cents, date: input.date } };
}
