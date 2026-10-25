import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

type Props = {
  title: string;
  subtitle?: string | null;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** The first row of a card has no rule above it. */
  first?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityHint?: string;
};

/** One row of a list inside a card: a name, an optional detail line and a value at the right. */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  first = false,
  onPress,
  onLongPress,
  accessibilityHint,
}: Props) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={accessibilityHint}
      disabled={!onPress && !onLongPress}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.row,
        !first && styles.ruled,
        pressed && styles.pressed,
      ]}
    >
      {leading}
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}

/** A right-aligned amount for the trailing slot of a row. */
export function RowFigure({ children }: { children: string }) {
  return <Text style={styles.figure}>{children}</Text>;
}

/** The arrow that tells a row opens another screen. */
export function Chevron() {
  return <View style={styles.chevron} />;
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 4,
  },
  ruled: { borderTopWidth: 1, borderTopColor: colors.rule },
  pressed: { backgroundColor: colors.surfaceMuted },
  text: { flex: 1, gap: 2 },
  title: { ...typography.body, fontWeight: '500', color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  figure: { ...typography.figure, color: colors.textPrimary },
  chevron: {
    width: 9,
    height: 9,
    borderTopWidth: 1.6,
    borderRightWidth: 1.6,
    borderColor: colors.icon,
    transform: [{ rotate: '45deg' }],
    marginRight: spacing.xs,
  },
});
