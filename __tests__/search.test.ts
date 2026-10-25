import { pageOf, parseListSearch } from '../src/search';

describe('what the search box understands', () => {
  test.each([
    ['', { kind: 'all' }],
    ['   ', { kind: 'all' }],
    ['15', { kind: 'amount', cents: 1500 }],
    ['15,50', { kind: 'amount', cents: 1550 }],
    ['R$ 1.234,00', { kind: 'amount', cents: 123400 }],
    ['25/10/2026', { kind: 'date', date: '2026-10-25' }],
    ['5/3/2026', { kind: 'date', date: '2026-03-05' }],
    ['25/10', { kind: 'dayOfYear', monthDay: '10-25' }],
    ['10/2026', { kind: 'month', month: '2026-10' }],
    ['Barra da calça', { kind: 'text', text: 'Barra da calça' }],
  ])('"%s"', (typed, expected) => {
    expect(parseListSearch(typed)).toEqual(expected);
  });

  test.each([['31/02/2026'], ['32/10'], ['10/13/2026'], ['13/2026']])(
    'an impossible date "%s" is searched as text',
    typed => {
      expect(parseListSearch(typed)).toEqual({ kind: 'text', text: typed });
    },
  );
});

describe('a page of a list already in memory', () => {
  test('slices from the offset and counts every row', () => {
    const rows = Array.from({ length: 45 }, (_, index) => index);

    expect(pageOf(rows, { offset: 0, limit: 20 })).toEqual({
      items: rows.slice(0, 20),
      total: 45,
    });
    expect(pageOf(rows, { offset: 40, limit: 20 })).toEqual({
      items: [40, 41, 42, 43, 44],
      total: 45,
    });
    expect(pageOf(rows, { offset: 60, limit: 20 })).toEqual({
      items: [],
      total: 45,
    });
  });
});
