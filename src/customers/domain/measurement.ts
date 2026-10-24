/** A free-form measurement: the seamstress chooses both key and value. */
export type Measurement = {
  id: number;
  customerId: number;
  key: string;
  value: string;
};

export type MeasurementInput = {
  key: string;
  value: string;
};

export type MeasurementError = 'key-required' | 'key-taken' | 'not-found';

export type SaveMeasurementResult =
  | { ok: true; measurement: Measurement }
  | { ok: false; error: MeasurementError };

export function validateMeasurement(
  input: MeasurementInput,
):
  | { ok: true; measurement: MeasurementInput }
  | { ok: false; error: 'key-required' } {
  const key = input.key.trim();
  if (key === '') {
    return { ok: false, error: 'key-required' };
  }
  return { ok: true, measurement: { key, value: input.value.trim() } };
}
