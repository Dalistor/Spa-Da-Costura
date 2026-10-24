import { formatCents, parseCents, sumCents } from '../src/money';

describe('parseCents', () => {
  test.each([
    ['12', 1200],
    ['12,5', 1250],
    ['12,50', 1250],
    ['0,10', 10],
    ['0', 0],
    ['1.234,56', 123456],
    ['1234,56', 123456],
    ['1.234.567,89', 123456789],
    ['12.50', 1250],
    ['1.234', 123400],
    [' R$ 12,50 ', 1250],
  ])('reads "%s" as %i cents', (text, cents) => {
    expect(parseCents(text)).toEqual({ ok: true, cents });
  });

  test.each([
    ['', 'empty'],
    ['   ', 'empty'],
    ['abc', 'invalid'],
    ['12,505', 'invalid'],
    ['1,2,3', 'invalid'],
    ['12.34,5.6', 'invalid'],
    ['1.23,45', 'invalid'],
    ['-5', 'negative'],
    ['-0,50', 'negative'],
  ])('rejects "%s" as %s', (text, error) => {
    expect(parseCents(text)).toEqual({ ok: false, error });
  });
});

describe('formatCents', () => {
  test.each([
    [0, 'R$ 0,00'],
    [5, 'R$ 0,05'],
    [1250, 'R$ 12,50'],
    [123456, 'R$ 1.234,56'],
    [123456789, 'R$ 1.234.567,89'],
    [-3000, '-R$ 30,00'],
  ])('formats %i as "%s"', (cents, text) => {
    expect(formatCents(cents)).toBe(text);
  });
});

describe('sumCents', () => {
  test('adds amounts without floating point drift', () => {
    expect(sumCents([10, 20])).toBe(30);
    expect(sumCents(Array(1000).fill(1))).toBe(1000);
    expect(sumCents([])).toBe(0);
  });

  test('refuses non-integer amounts', () => {
    expect(() => sumCents([10, 0.5])).toThrow(RangeError);
  });
});
