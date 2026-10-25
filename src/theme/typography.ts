import type { TextStyle } from 'react-native';

export const typography = {
  screenTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.2 },
  title: { fontSize: 20, fontWeight: '700' },
  section: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  /** Money and measurements: digits of equal width so columns line up. */
  figure: { fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
} as const satisfies Record<string, TextStyle>;
