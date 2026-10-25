import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatBusinessDate,
  fromBusinessDate,
  toBusinessDate,
  type BusinessDate,
} from '../../calendar';
import { colors, spacing, typography } from '../../theme';

type Props = {
  label: string;
  value: BusinessDate;
  onChange: (date: BusinessDate) => void;
};

/** Shows a business date and lets the user pick another in Android's calendar dialog. */
export function DateField({ label, value, onChange }: Props) {
  const pick = () =>
    DateTimePickerAndroid.open({
      value: fromBusinessDate(value),
      mode: 'date',
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          onChange(toBusinessDate(date));
        }
      },
    });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatBusinessDate(value)}`}
        onPress={pick}
        style={styles.field}
      >
        <Text style={styles.value}>{formatBusinessDate(value)}</Text>
        <Text style={styles.action}>Alterar</Text>
      </Pressable>
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
  field: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  value: { ...typography.body, color: colors.textPrimary },
  action: { ...typography.caption, color: colors.accent, fontWeight: '600' },
});
