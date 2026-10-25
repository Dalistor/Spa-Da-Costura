import type { ListSearch, Page, PageRequest } from '../../search';
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
  /** Jobs of customers not deleted matching a description, customer, amount or delivery date. */
  search(search: ListSearch, page: PageRequest): Promise<Page<JobListItem>>;
  /** Nearest delivery first. */
  listForCustomer(customerId: number): Promise<Job[]>;
  /** The customer's jobs matching a description, amount or delivery date, nearest first. */
  searchForCustomer(
    customerId: number,
    search: ListSearch,
    page: PageRequest,
  ): Promise<Page<Job>>;
  get(id: number): Promise<Job | null>;
  /** New jobs start as pending. */
  create(customerId: number, input: JobInput): Promise<SaveJobResult>;
  update(id: number, input: JobInput): Promise<SaveJobResult>;
  setStatus(id: number, status: JobStatus): Promise<void>;
  remove(id: number): Promise<void>;
}
