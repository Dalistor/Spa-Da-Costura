import type { ExpenseCategory, ExpenseError, PaymentError } from '../domain';

export const paymentErrorMessages: Record<PaymentError, string> = {
  'amount-invalid': 'Informe um valor maior que zero, como 40,00.',
  'date-invalid': 'Escolha a data do pagamento.',
  'not-found': 'Este pagamento não existe mais.',
};

export const categoryLabels: Record<ExpenseCategory, string> = {
  fees: 'Taxas',
  tax: 'Imposto',
  materials: 'Materiais',
};

export const expenseErrorMessages: Record<ExpenseError, string> = {
  'description-required': 'Informe a descrição da despesa.',
  'category-required': 'Escolha a categoria.',
  'amount-invalid': 'Informe um valor maior que zero, como 35,00.',
  'date-invalid': 'Escolha a data da despesa.',
  'not-found': 'Esta despesa não existe mais.',
};
