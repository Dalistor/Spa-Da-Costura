import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../domain';
import { categoryLabels } from './labels';

type Props = {
  value: ExpenseCategory | null;
  onChange: (category: ExpenseCategory) => void;
};

export function CategorySelector({ value, onChange }: Props) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {EXPENSE_CATEGORIES.map(category => {
        const selected = category === value;
        return (
          <Pressable
            key={category}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(category)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {categoryLabels[category]}
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
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { ...typography.caption, color: colors.textPrimary },
  selectedLabel: { color: colors.onAccent, fontWeight: '600' },
});
