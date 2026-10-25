import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import { formatBusinessDate } from '../../calendar';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Card, ListRow, RowFigure, Section, useFocusedLoad } from '../../ui';
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
    <Section
      title="Pagamentos"
      action={{
        label: 'Novo pagamento',
        onPress: () => navigation.navigate('PaymentForm', { customerId }),
      }}
    >
      <Card>
        {payments && payments.length === 0 ? (
          <Text style={styles.empty}>Nenhum pagamento registrado.</Text>
        ) : null}
        {payments?.map((payment, index) => (
          <ListRow
            key={payment.id}
            first={index === 0}
            title={formatBusinessDate(payment.date)}
            trailing={<RowFigure>{formatCents(payment.amountCents)}</RowFigure>}
            accessibilityHint="Abre o pagamento para editar ou excluir"
            onPress={() =>
              navigation.navigate('PaymentForm', {
                customerId,
                paymentId: payment.id,
              })
            }
          />
        ))}
      </Card>
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.md,
  },
});
