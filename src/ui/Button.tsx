import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' ? styles.onAccent : styles[`${variant}Label`],
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.accent },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  danger: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dimmed: { opacity: 0.6 },
  label: { ...typography.body, fontWeight: '600' },
  onAccent: { color: colors.onAccent },
  secondaryLabel: { color: colors.accent },
  dangerLabel: { color: colors.danger },
});
