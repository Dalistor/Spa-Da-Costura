import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatBusinessDate } from '../../calendar';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Button, useFocusedLoad } from '../../ui';
import { useProductRepositories } from './ProductRepositories';

/** Products sold to the customer, shown inside the customer detail. */
export function CustomerProductSalesSection({
  customerId,
}: {
  customerId: number;
}) {
  const navigation = useNavigation();
  const { sales: repository } = useProductRepositories();
  const [sales] = useFocusedLoad(
    useCallback(
      () => repository.listForCustomer(customerId),
      [customerId, repository],
    ),
  );

  return (
    <View>
      <Text style={styles.section}>Produtos vendidos</Text>
      <View style={styles.card}>
        {sales && sales.length === 0 ? (
          <Text style={styles.empty}>Nenhum produto vendido.</Text>
        ) : null}
        {sales?.map(sale => (
          <Pressable
            key={sale.id}
            accessibilityRole="button"
            accessibilityHint="Abre a venda para editar ou excluir"
            onPress={() =>
              navigation.navigate('ProductSaleForm', {
                customerId,
                saleId: sale.id,
              })
            }
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.line}>
              <Text style={styles.name}>{sale.productName}</Text>
              <Text style={styles.amount}>{formatCents(sale.amountCents)}</Text>
            </View>
            <Text style={styles.muted}>{formatBusinessDate(sale.date)}</Text>
          </Pressable>
        ))}
        <Button
          title="Vender produto"
          variant="secondary"
          onPress={() => navigation.navigate('ProductSaleForm', { customerId })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  row: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { ...typography.body, color: colors.textPrimary, flexShrink: 1 },
  amount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  muted: { ...typography.caption, color: colors.textSecondary },
});
