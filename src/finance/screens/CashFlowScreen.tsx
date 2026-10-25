import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatBusinessDate,
  formatBusinessMonth,
  monthOf,
  nextMonth,
  previousMonth,
  todayLocal,
} from '../../calendar';
import { formatCents, type Cents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Button, useFocusedLoad } from '../../ui';
import { cashFlowSummary } from '../domain';
import { useFinanceRepositories } from './FinanceRepositories';
import { categoryLabels } from './labels';

/** Income, expenses and balance of one month, starting on the current one. */
export function CashFlowScreen() {
  const navigation = useNavigation();
  const { expenses, cashFlow } = useFinanceRepositories();
  const [month, setMonth] = useState(() => monthOf(todayLocal()));
  const [data] = useFocusedLoad(
    useCallback(async () => {
      const [totals, monthExpenses] = await Promise.all([
        cashFlow.totalsFor(month),
        expenses.listForMonth(month),
      ]);
      return { month, summary: cashFlowSummary(totals), monthExpenses };
    }, [month, cashFlow, expenses]),
  );
  // Until the new month loads, keep showing nothing rather than the old month.
  const current = data?.month === month ? data : undefined;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.monthBar}>
        <MonthArrow
          label="‹"
          description="Mês anterior"
          onPress={() => setMonth(previousMonth)}
        />
        <Text style={styles.month}>{formatBusinessMonth(month)}</Text>
        <MonthArrow
          label="›"
          description="Próximo mês"
          onPress={() => setMonth(nextMonth)}
        />
      </View>

      {current ? (
        <>
          <View style={styles.card}>
            <Total label="Entradas" cents={current.summary.incomeCents} />
            <Total label="Saídas" cents={current.summary.expensesCents} />
            <Total
              label="Saldo"
              cents={current.summary.balanceCents}
              negative={current.summary.balanceCents < 0}
            />
          </View>

          <Text style={styles.section}>Despesas do mês</Text>
          <View style={styles.card}>
            <View style={styles.list}>
              {current.monthExpenses.length === 0 ? (
                <Text style={styles.empty}>Nenhuma despesa neste mês.</Text>
              ) : null}
              {current.monthExpenses.map(expense => (
                <Pressable
                  key={expense.id}
                  accessibilityRole="button"
                  accessibilityHint="Abre a despesa para editar ou excluir"
                  onPress={() =>
                    navigation.navigate('ExpenseForm', {
                      expenseId: expense.id,
                    })
                  }
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.line}>
                    <Text style={styles.name}>{expense.description}</Text>
                    <Text style={styles.amount}>
                      {formatCents(expense.amountCents)}
                    </Text>
                  </View>
                  <Text style={styles.muted}>
                    {categoryLabels[expense.category]} ·{' '}
                    {formatBusinessDate(expense.date)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Button
              title="Nova despesa"
              variant="secondary"
              onPress={() => navigation.navigate('ExpenseForm')}
            />
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function MonthArrow({
  label,
  description,
  onPress,
}: {
  label: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={description}
      onPress={onPress}
      style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
    >
      <Text style={styles.arrowLabel}>{label}</Text>
    </Pressable>
  );
}

function Total({
  label,
  cents,
  negative = false,
}: {
  label: string;
  cents: Cents;
  negative?: boolean;
}) {
  return (
    <View style={styles.total}>
      <Text style={styles.totalLabel}>{label}</Text>
      <Text style={[styles.totalValue, negative && styles.negative]}>
        {formatCents(cents)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  month: { ...typography.title, color: colors.textPrimary },
  arrow: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  arrowLabel: { ...typography.title, color: colors.accent },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  totalLabel: { ...typography.body, color: colors.textSecondary },
  totalValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  negative: { color: colors.danger },
  section: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: { marginBottom: spacing.sm },
  empty: { ...typography.body, color: colors.textSecondary },
  row: {
    paddingVertical: spacing.sm,
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
