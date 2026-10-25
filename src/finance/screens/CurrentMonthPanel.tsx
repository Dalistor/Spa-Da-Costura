import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { formatBusinessMonth, monthOf, todayLocal } from '../../calendar';
import { useFocusedLoad } from '../../ui';
import { cashFlowSummary } from '../domain';
import { useFinanceRepositories } from './FinanceRepositories';
import { MonthSummaryCard } from './MonthSummaryCard';

/** This month's balance on the home screen; tapping it opens the cash flow. */
export function CurrentMonthPanel() {
  const navigation = useNavigation();
  const { cashFlow } = useFinanceRepositories();
  const [data] = useFocusedLoad(
    useCallback(async () => {
      const month = monthOf(todayLocal());
      const totals = await cashFlow.totalsFor(month);
      return { month, summary: cashFlowSummary(totals) };
    }, [cashFlow]),
  );
  if (!data) {
    return null;
  }

  return (
    <MonthSummaryCard
      label={`Saldo de ${formatBusinessMonth(data.month).toLowerCase()}`}
      summary={data.summary}
      onPress={() => navigation.navigate('Tabs', { screen: 'CashFlow' })}
    />
  );
}
