import type { JobError, JobStatus } from '../domain';

export const STATUSES: readonly JobStatus[] = ['pending', 'ready', 'delivered'];

export const statusLabels: Record<JobStatus, string> = {
  pending: 'A fazer',
  ready: 'Pronto',
  delivered: 'Entregue',
};

export const jobErrorMessages: Record<JobError, string> = {
  'description-required': 'Informe a descrição do serviço.',
  'amount-invalid': 'Informe um valor válido, como 25,00.',
  'date-invalid': 'Escolha a data de entrega.',
  'not-found': 'Este serviço não existe mais.',
};
