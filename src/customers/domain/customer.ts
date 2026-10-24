export type Customer = {
  id: number;
  name: string;
  phone: string | null;
  description: string | null;
};

export type CustomerInput = {
  name: string;
  phone?: string;
  description?: string;
};

export type CustomerError = 'name-required' | 'not-found';

export type SaveCustomerResult =
  | { ok: true; customer: Customer }
  | { ok: false; error: CustomerError };

export type ValidCustomer = Omit<Customer, 'id'>;

/** Trims the fields; blank optional fields become null. */
export function validateCustomer(
  input: CustomerInput,
):
  | { ok: true; customer: ValidCustomer }
  | { ok: false; error: 'name-required' } {
  const name = input.name.trim();
  if (name === '') {
    return { ok: false, error: 'name-required' };
  }
  return {
    ok: true,
    customer: {
      name,
      phone: optionalText(input.phone),
      description: optionalText(input.description),
    },
  };
}

function optionalText(text: string | undefined): string | null {
  const trimmed = text?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

const nameCollator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export function compareByName(a: Customer, b: Customer): number {
  return nameCollator.compare(a.name, b.name);
}

/** Customers whose name contains `query`, ignoring letter case. */
export function searchByName(customers: Customer[], query: string): Customer[] {
  const wanted = query.trim().toLocaleLowerCase('pt-BR');
  if (wanted === '') {
    return customers;
  }
  return customers.filter(customer =>
    customer.name.toLocaleLowerCase('pt-BR').includes(wanted),
  );
}
