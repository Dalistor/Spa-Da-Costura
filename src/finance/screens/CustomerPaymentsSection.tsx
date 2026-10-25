import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatBusinessDate } from '../../calendar';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Button, useFocusedLoad } from '../../ui';
import { useFinanceRepositories } from './FinanceRepositories';

/** Payments of the customer, shown inside the customer detail. */
export function CustomerPaymentsSection({
  customerId,
}: {
  customerId: number;
}) {
  const navigation = useNavigation();
  const { payments: repository } = useFinanceRepositories();
  const [payments] = useFocusedLoad(
    useCallback(
      () => repository.listForCustomer(customerId),
      [customerId, repository],
    ),
  );

  return (
    <View>
      <Text style={styles.section}>Pagamentos</Text>
      <View style={styles.card}>
        {payments && payments.length === 0 ? (
          <Text style={styles.empty}>Nenhum pagamento registrado.</Text>
        ) : null}
        {payments?.map(payment => (
          <Pressable
            key={payment.id}
            accessibilityRole="button"
            accessibilityHint="Abre o pagamento para editar ou excluir"
            onPress={() =>
              navigation.navigate('PaymentForm', {
                customerId,
                paymentId: payment.id,
              })
            }
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <Text style={styles.date}>{formatBusinessDate(payment.date)}</Text>
            <Text style={styles.amount}>
              {formatCents(payment.amountCents)}
            </Text>
          </Pressable>
        ))}
        <Button
          title="Registrar pagamento"
          variant="secondary"
          onPress={() => navigation.navigate('PaymentForm', { customerId })}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  date: { ...typography.body, color: colors.textPrimary },
  amount: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
});
