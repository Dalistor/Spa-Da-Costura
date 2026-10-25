import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
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
