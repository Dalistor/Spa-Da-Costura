import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

type Props = {
  title: string;
  /** The section's one action, shown as a text button beside the title. */
  action?: { label: string; onPress: () => void };
  children: ReactNode;
};

/** A titled block of the screen, with an optional action at its right. */
export function Section({ title, action, children }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {action ? (
          <Pressable
            accessibilityRole="button"
            onPress={action.onPress}
            hitSlop={8}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: { ...typography.section, color: colors.textPrimary },
  action: { minHeight: 44, justifyContent: 'center', paddingLeft: spacing.md },
  pressed: { opacity: 0.6 },
  actionLabel: { fontSize: 15, fontWeight: '600', color: colors.accent },
});
