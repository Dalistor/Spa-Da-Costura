import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatCents, type Cents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { useFocusedLoad } from '../../ui';
import { customerBalance } from '../domain';
import { useFinanceRepositories } from './FinanceRepositories';

/** Paid, due and credit of the customer, shown inside the customer detail. */
export function CustomerBalanceSection({ customerId }: { customerId: number }) {
  const { payments } = useFinanceRepositories();
  const [totals] = useFocusedLoad(
    useCallback(() => payments.totalsFor(customerId), [customerId, payments]),
  );
  if (!totals) {
    return null;
  }
  const { totalPaid, amountDue, credit } = customerBalance(totals);

  return (
    <View style={styles.card}>
      <Total label="Pago" cents={totalPaid} />
      <Total label="Devido" cents={amountDue} highlighted={amountDue > 0} />
      {credit > 0 ? <Total label="Crédito" cents={credit} /> : null}
    </View>
  );
}

function Total({
  label,
  cents,
  highlighted = false,
}: {
  label: string;
  cents: Cents;
  highlighted?: boolean;
}) {
  return (
    <View style={styles.total}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlighted && styles.due]}>
        {formatCents(cents)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  total: { flex: 1 },
  label: { ...typography.caption, color: colors.textSecondary },
  value: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  due: { color: colors.accent },
});
