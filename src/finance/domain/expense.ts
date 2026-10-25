import { isBusinessDate, type BusinessDate } from '../../calendar';
import { parseCents, type Cents } from '../../money';

// `fees` (Taxas) is no longer offered (financeiro@2); it stays readable so
// expenses saved before keep showing in lists and totals.
export type ExpenseCategory = 'fees' | 'tax' | 'materials';

/** Categories the seamstress can pick for a new or edited expense. */
export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  'tax',
  'materials',
];

/** Money the atelier spent (despesa). */
export type Expense = {
  id: number;
  description: string;
  category: ExpenseCategory;
  amountCents: Cents;
  date: BusinessDate;
};

/** What the seamstress types; no category until she picks one. */
export type ExpenseInput = {
  description: string;
  category: ExpenseCategory | null;
  amount: string;
  date: BusinessDate;
};

export type ExpenseError =
  | 'description-required'
  | 'category-required'
  | 'amount-invalid'
  | 'date-invalid'
  | 'not-found';

export type SaveExpenseResult =
  | { ok: true; expense: Expense }
  | { ok: false; error: ExpenseError };

export type ValidExpense = Omit<Expense, 'id'>;

export function validateExpense(
  input: ExpenseInput,
):
  | { ok: true; expense: ValidExpense }
  | { ok: false; error: Exclude<ExpenseError, 'not-found'> } {
  const description = input.description.trim();
  if (description === '') {
    return { ok: false, error: 'description-required' };
  }
  const { category } = input;
  if (category === null || !EXPENSE_CATEGORIES.includes(category)) {
    return { ok: false, error: 'category-required' };
  }
  const amount = parseCents(input.amount);
  if (!amount.ok || amount.cents === 0) {
    return { ok: false, error: 'amount-invalid' };
  }
  if (!isBusinessDate(input.date)) {
    return { ok: false, error: 'date-invalid' };
  }
  return {
    ok: true,
    expense: {
      description,
      category,
      amountCents: amount.cents,
      date: input.date,
    },
  };
}
