import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Avatar, Card, ListRow, Section, useFocusedLoad } from '../../ui';
import { totalAmountDue } from '../domain';
import { useFinanceRepositories } from './FinanceRepositories';

const SHOWN = 5;

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
          <Text style={styles.totalValue} adjustsFontSizeToFit numberOfLines={1}>
            {formatCents(totalAmountDue(amounts))}
          </Text>
          <Text style={styles.muted}>
            {amounts.length === 0 ? 'Ninguém está devendo' : `${debtors} devendo`}
          </Text>
        </View>
        {amounts.slice(0, SHOWN).map(amount => (
          <ListRow
            key={amount.customerId}
            title={amount.customerName}
            leading={<Avatar name={amount.customerName} />}
            trailing={
              <Text style={styles.due} numberOfLines={1}>
                {formatCents(amount.amountDueCents)}
              </Text>
            }
            onPress={() =>
              navigation.navigate('CustomerDetail', {
                customerId: amount.customerId,
              })
            }
          />
        ))}
        {amounts.length > SHOWN ? (
          <Text style={styles.more}>
            {amounts.length - SHOWN === 1
              ? 'Mais 1 cliente devendo'
              : `Mais ${amounts.length - SHOWN} clientes devendo`}
          </Text>
        ) : null}
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
  due: { ...typography.figure, color: colors.accent, flexShrink: 0 },
  more: {
    ...typography.caption,
    color: colors.textSecondary,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
});
