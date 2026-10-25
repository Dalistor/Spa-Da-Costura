import { isBusinessDate, type BusinessDate } from '../../calendar';
import { parseCents, type Cents } from '../../money';

export type JobStatus = 'pending' | 'ready' | 'delivered';

/** A sewing job (conserto) done for a customer. */
export type Job = {
  id: number;
  customerId: number;
  description: string;
  amountCents: Cents;
  status: JobStatus;
  deliveryDate: BusinessDate;
};

/** A job as listed in the jobs tab, with its customer's name. */
export type JobListItem = Job & { customerName: string };

/** What the seamstress types; the amount is text in reais ("25,00"). */
export type JobInput = {
  description: string;
  amount: string;
  deliveryDate: BusinessDate;
};

export type JobError =
  | 'description-required'
  | 'amount-invalid'
  | 'date-invalid'
  | 'not-found';

export type SaveJobResult =
  | { ok: true; job: Job }
  | { ok: false; error: JobError };

export type ValidJob = Pick<
  Job,
  'description' | 'amountCents' | 'deliveryDate'
>;

export function validateJob(
  input: JobInput,
):
  | { ok: true; job: ValidJob }
  | { ok: false; error: Exclude<JobError, 'not-found'> } {
  const description = input.description.trim();
  if (description === '') {
    return { ok: false, error: 'description-required' };
  }
  const amount = parseCents(input.amount);
  if (!amount.ok) {
    return { ok: false, error: 'amount-invalid' };
  }
  if (!isBusinessDate(input.deliveryDate)) {
    return { ok: false, error: 'date-invalid' };
  }
  return {
    ok: true,
    job: {
      description,
      amountCents: amount.cents,
      deliveryDate: input.deliveryDate,
    },
  };
}
