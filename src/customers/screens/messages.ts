import type { CustomerError, MeasurementError } from '../domain';

export const customerErrorMessages: Record<CustomerError, string> = {
  'name-required': 'Informe o nome do cliente.',
  'not-found': 'Este cliente não existe mais.',
};

export const measurementErrorMessages: Record<MeasurementError, string> = {
  'key-required': 'Informe o nome da medida.',
  'key-taken': 'Este cliente já tem uma medida com esse nome.',
  'not-found': 'Esta medida não existe mais.',
};
