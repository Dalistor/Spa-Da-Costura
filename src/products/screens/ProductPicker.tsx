import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import type { Product } from '../domain';

type Props = {
  products: Product[];
  selectedId: number | null;
  /** Name kept by a sale whose product left the catalog; shown as selected. */
  removedName?: string;
  onSelect: (product: Product) => void;
};

/** The catalog as a single-choice list, each option with its price. */
export function ProductPicker({
  products,
  selectedId,
  removedName,
  onSelect,
}: Props) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {removedName !== undefined && selectedId === null ? (
        <View
          accessibilityRole="radio"
          accessibilityState={{ selected: true }}
          style={[styles.option, styles.selected]}
        >
          <Text style={[styles.name, styles.selectedText]}>{removedName}</Text>
          <Text style={[styles.detail, styles.selectedText]}>
            Fora do catálogo
          </Text>
        </View>
      ) : null}
      {products.map(product => {
        const selected = product.id === selectedId;
        return (
          <Pressable
            key={product.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(product)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.name, selected && styles.selectedText]}>
              {product.name}
            </Text>
            <Text style={[styles.detail, selected && styles.selectedText]}>
              {formatCents(product.priceCents)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.xs },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  name: { ...typography.body, color: colors.textPrimary, flexShrink: 1 },
  detail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  selectedText: { color: colors.onAccent, fontWeight: '600' },
});
