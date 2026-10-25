import type { BusinessMonth } from '../../calendar';
import type { ListSearch, Page, PageRequest } from '../../search';
import type { AmountDue, CustomerTotals } from './balance';
import type { MonthTotals } from './cashFlow';
import type { Expense, ExpenseInput, SaveExpenseResult } from './expense';
import type { Payment, PaymentInput, SavePaymentResult } from './payment';

export interface PaymentRepository {
  /** Most recent first. */
  listForCustomer(customerId: number): Promise<Payment[]>;
  /** The customer's payments matching an amount or a date, most recent first. */
  searchForCustomer(
    customerId: number,
    search: ListSearch,
    page: PageRequest,
  ): Promise<Page<Payment>>;
  get(id: number): Promise<Payment | null>;
  create(customerId: number, input: PaymentInput): Promise<SavePaymentResult>;
  update(id: number, input: PaymentInput): Promise<SavePaymentResult>;
  remove(id: number): Promise<void>;
  /** Sums of the customer's jobs and products sold, and of their payments. */
  totalsFor(customerId: number): Promise<CustomerTotals>;
  /** Customers not deleted whose charges exceed their payments, largest debt first. */
  listAmountsDue(): Promise<AmountDue[]>;
}

export interface ExpenseRepository {
  /** Oldest first. */
  listForMonth(month: BusinessMonth): Promise<Expense[]>;
  /** The month's expenses matching a description, amount or date, oldest first. */
  searchForMonth(
    month: BusinessMonth,
    search: ListSearch,
    page: PageRequest,
  ): Promise<Page<Expense>>;
  get(id: number): Promise<Expense | null>;
  create(input: ExpenseInput): Promise<SaveExpenseResult>;
  update(id: number, input: ExpenseInput): Promise<SaveExpenseResult>;
  remove(id: number): Promise<void>;
}

export interface CashFlowRepository {
  /** Every payment counts, including those of deleted customers. */
  totalsFor(month: BusinessMonth): Promise<MonthTotals>;
}
