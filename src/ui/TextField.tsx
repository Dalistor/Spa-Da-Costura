import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, spacing, typography } from '../theme';

type Props = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, ...input }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          input.multiline && styles.multiline,
          error ? styles.invalid : null,
        ]}
        {...input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  multiline: {
    minHeight: 96,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  invalid: { borderColor: colors.danger },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});
