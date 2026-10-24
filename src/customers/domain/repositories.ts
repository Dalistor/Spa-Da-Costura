import type { Customer, CustomerInput, SaveCustomerResult } from './customer';
import type {
  Measurement,
  MeasurementInput,
  SaveMeasurementResult,
} from './measurement';

/** Deleted customers are never returned. */
export interface CustomerRepository {
  /** Sorted by name. */
  list(): Promise<Customer[]>;
  get(id: number): Promise<Customer | null>;
  create(input: CustomerInput): Promise<SaveCustomerResult>;
  update(id: number, input: CustomerInput): Promise<SaveCustomerResult>;
}

export interface MeasurementRepository {
  /** Sorted by key. */
  listFor(customerId: number): Promise<Measurement[]>;
  get(id: number): Promise<Measurement | null>;
  add(
    customerId: number,
    input: MeasurementInput,
  ): Promise<SaveMeasurementResult>;
  update(id: number, input: MeasurementInput): Promise<SaveMeasurementResult>;
  remove(id: number): Promise<void>;
}
