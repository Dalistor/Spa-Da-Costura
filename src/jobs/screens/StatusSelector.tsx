import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import type { JobStatus } from '../domain';
import { STATUSES, statusLabels } from './labels';

type Props = {
  value: JobStatus;
  onChange: (status: JobStatus) => void;
};

export function StatusSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {STATUSES.map(status => {
        const selected = status === value;
        return (
          <Pressable
            key={status}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(status)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {statusLabels[status]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  option: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.control,
    backgroundColor: colors.surface,
  },
  selected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  label: { fontSize: 14, color: colors.textPrimary },
  selectedLabel: { color: colors.onAccent, fontWeight: '600' },
});
