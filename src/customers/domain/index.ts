export {
  compareByName,
  searchByName,
  validateCustomer,
  type Customer,
  type CustomerError,
  type CustomerInput,
  type SaveCustomerResult,
} from './customer';
export {
  validateMeasurement,
  type Measurement,
  type MeasurementError,
  type MeasurementInput,
  type SaveMeasurementResult,
} from './measurement';
export type { CustomerRepository, MeasurementRepository } from './repositories';
