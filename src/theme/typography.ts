import type { TextStyle } from 'react-native';

export const typography = {
  title: { fontSize: 22, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;
