import { isBusinessDate, type BusinessDate } from '../../calendar';
import { parseCents, type Cents } from '../../money';

export type ExpenseCategory = 'fees' | 'tax' | 'materials';

export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  'fees',
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
