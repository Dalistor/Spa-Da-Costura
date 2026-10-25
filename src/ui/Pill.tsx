import { StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme';

type Tone = 'neutral' | 'accent' | 'quiet' | 'danger';

/** A short status word on a pale tint of its own hue. */
export function Pill({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  return (
    <Text style={[styles.pill, styles[tone]]} numberOfLines={1}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
    flexShrink: 0,
  },
  neutral: { backgroundColor: colors.surfaceMuted, color: colors.textPrimary },
  accent: { backgroundColor: colors.accentTint, color: colors.accentInk },
  quiet: {
    backgroundColor: colors.background,
    color: colors.textSecondary,
  },
  danger: { backgroundColor: colors.dangerTint, color: colors.dangerInk },
});
