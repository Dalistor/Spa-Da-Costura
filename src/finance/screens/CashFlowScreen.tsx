import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatBusinessMonth,
  monthOf,
  nextMonth,
  previousMonth,
  todayLocal,
} from '../../calendar';
import { colors, radius, spacing, typography } from '../../theme';
import { Card, SeeAllRow, Section, useFocusedLoad } from '../../ui';
import { cashFlowSummary } from '../domain';
import { useFinanceRepositories } from './FinanceRepositories';
import { ExpenseRow } from './ExpenseRow';
import { MonthSummaryCard } from './MonthSummaryCard';

const SHOWN = 5;

/** Income, expenses and balance of one month, starting on the current one. */
export function CashFlowScreen() {
  const navigation = useNavigation();
  const { expenses, cashFlow } = useFinanceRepositories();
  const [month, setMonth] = useState(() => monthOf(todayLocal()));
  const [data] = useFocusedLoad(
    useCallback(async () => {
      const [totals, monthExpenses] = await Promise.all([
        cashFlow.totalsFor(month),
        expenses.searchForMonth(
          month,
          { kind: 'all' },
          { offset: 0, limit: SHOWN },
        ),
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
          direction="previous"
          description="Mês anterior"
          onPress={() => setMonth(previousMonth)}
        />
        <Text style={styles.month}>{formatBusinessMonth(month)}</Text>
        <MonthArrow
          direction="next"
          description="Próximo mês"
          onPress={() => setMonth(nextMonth)}
        />
      </View>

      {current ? (
        <>
          <MonthSummaryCard
            label="Saldo do mês"
            summary={current.summary}
          />

          <Section
            title="Despesas do mês"
            action={{
              label: 'Nova despesa',
              onPress: () => navigation.navigate('ExpenseForm'),
            }}
          >
            <Card>
              {current.monthExpenses.total === 0 ? (
                <Text style={styles.empty}>Nenhuma despesa neste mês.</Text>
              ) : null}
              {current.monthExpenses.items.map((expense, index) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  first={index === 0}
                />
              ))}
              {current.monthExpenses.total > SHOWN ? (
                <SeeAllRow
                  label={`Ver todas as ${current.monthExpenses.total} despesas`}
                  onPress={() =>
                    navigation.navigate('MonthExpenses', { month })
                  }
                />
              ) : null}
            </Card>
          </Section>
        </>
      ) : null}
    </ScrollView>
  );
}

function MonthArrow({
  direction,
  description,
  onPress,
}: {
  direction: 'previous' | 'next';
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
      <View
        style={[
          styles.chevron,
          direction === 'previous' ? styles.previous : styles.next,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xl,
  },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -spacing.sm - 4,
    marginBottom: spacing.sm,
  },
  month: { ...typography.section, color: colors.textPrimary },
  arrow: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  chevron: {
    width: 11,
    height: 11,
    borderTopWidth: 1.8,
    borderRightWidth: 1.8,
    borderColor: colors.textPrimary,
  },
  previous: { transform: [{ rotate: '-135deg' }], marginLeft: 4 },
  next: { transform: [{ rotate: '45deg' }], marginRight: 4 },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.md,
  },
});
