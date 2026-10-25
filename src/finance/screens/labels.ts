import type { PaymentError } from '../domain';

export const paymentErrorMessages: Record<PaymentError, string> = {
  'amount-invalid': 'Informe um valor maior que zero, como 40,00.',
  'date-invalid': 'Escolha a data do pagamento.',
  'not-found': 'Este pagamento não existe mais.',
};
