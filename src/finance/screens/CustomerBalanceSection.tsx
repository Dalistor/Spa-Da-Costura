import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatCents, type Cents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Card, useFocusedLoad } from '../../ui';
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
    <Card style={styles.card}>
      <Total label="Devido" cents={amountDue} highlighted={amountDue > 0} />
      <Total label="Pago" cents={totalPaid} divided />
      {credit > 0 ? <Total label="Crédito" cents={credit} divided /> : null}
    </Card>
  );
}

function Total({
  label,
  cents,
  highlighted = false,
  divided = false,
}: {
  label: string;
  cents: Cents;
  highlighted?: boolean;
  divided?: boolean;
}) {
  return (
    <View style={[styles.total, divided && styles.divided]}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[styles.value, highlighted && styles.due]}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {formatCents(cents)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row' },
  total: { flex: 1, padding: spacing.md, gap: spacing.xs },
  divided: { borderLeftWidth: 1, borderLeftColor: colors.rule },
  label: { ...typography.caption, color: colors.textSecondary },
  value: {
    ...typography.figure,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  due: { color: colors.accent },
});
