import type { CustomerTotals } from './balance';
import type { Payment, PaymentInput, SavePaymentResult } from './payment';

export interface PaymentRepository {
  /** Most recent first. */
  listForCustomer(customerId: number): Promise<Payment[]>;
  get(id: number): Promise<Payment | null>;
  create(customerId: number, input: PaymentInput): Promise<SavePaymentResult>;
  update(id: number, input: PaymentInput): Promise<SavePaymentResult>;
  remove(id: number): Promise<void>;
  /** Sums of the customer's jobs and products sold, and of their payments. */
  totalsFor(customerId: number): Promise<CustomerTotals>;
}
