import type {
  Job,
  JobInput,
  JobListItem,
  JobStatus,
  SaveJobResult,
} from './job';

export interface JobRepository {
  /** Every job of customers that were not deleted, nearest delivery first. */
  listAll(): Promise<JobListItem[]>;
  /** Nearest delivery first. */
  listForCustomer(customerId: number): Promise<Job[]>;
  get(id: number): Promise<Job | null>;
  /** New jobs start as pending. */
  create(customerId: number, input: JobInput): Promise<SaveJobResult>;
  update(id: number, input: JobInput): Promise<SaveJobResult>;
  setStatus(id: number, status: JobStatus): Promise<void>;
  remove(id: number): Promise<void>;
}
