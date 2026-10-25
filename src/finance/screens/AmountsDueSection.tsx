import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Avatar, Card, ListRow, Section, useFocusedLoad } from '../../ui';
import { totalAmountDue } from '../domain';
import { useFinanceRepositories } from './FinanceRepositories';

/** Who still owes and how much, largest debt first, on the home screen. */
export function AmountsDueSection() {
  const navigation = useNavigation();
  const { payments } = useFinanceRepositories();
  const [amounts] = useFocusedLoad(
    useCallback(() => payments.listAmountsDue(), [payments]),
  );
  if (!amounts) {
    return null;
  }

  const debtors =
    amounts.length === 1 ? '1 cliente' : `${amounts.length} clientes`;
  return (
    <Section title="A receber">
      <Card>
        <View style={styles.total}>
          <Text style={styles.totalValue}>
            {formatCents(totalAmountDue(amounts))}
          </Text>
          <Text style={styles.muted}>
            {amounts.length === 0 ? 'Ninguém está devendo' : `${debtors} devendo`}
          </Text>
        </View>
        {amounts.map(amount => (
          <ListRow
            key={amount.customerId}
            title={amount.customerName}
            leading={<Avatar name={amount.customerName} />}
            trailing={
              <Text style={styles.due}>{formatCents(amount.amountDueCents)}</Text>
            }
            onPress={() =>
              navigation.navigate('CustomerDetail', {
                customerId: amount.customerId,
              })
            }
          />
        ))}
      </Card>
    </Section>
  );
}

const styles = StyleSheet.create({
  total: { padding: spacing.md, gap: 2 },
  totalValue: {
    ...typography.figure,
    fontSize: 26,
    fontWeight: '700',
    color: colors.accent,
  },
  muted: { ...typography.caption, color: colors.textSecondary },
  due: { ...typography.figure, color: colors.accent },
});
