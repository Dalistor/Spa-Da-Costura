import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { formatBusinessMonth } from '../../calendar';
import type { ListSearch, PageRequest } from '../../search';
import { Button, CardSegment, PagedList } from '../../ui';
import { ExpenseRow } from './ExpenseRow';
import { useFinanceRepositories } from './FinanceRepositories';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'MonthExpenses'>,
  'MonthExpenses'
>;

/** Every expense of one month, searchable by description, amount or date. */
export function MonthExpensesScreen() {
  const navigation = useNavigation();
  const { month } = useRoute<Route>().params;
  const { expenses } = useFinanceRepositories();
  const load = useCallback(
    (search: ListSearch, page: PageRequest) =>
      expenses.searchForMonth(month, search, page),
    [expenses, month],
  );

  useEffect(() => {
    navigation.setOptions({
      title: `Despesas de ${formatBusinessMonth(month).toLowerCase()}`,
    });
  }, [month, navigation]);

  return (
    <PagedList
      load={load}
      keyOf={expense => String(expense.id)}
      placeholder="Buscar descrição, valor ou data"
      countLabel={total => (total === 1 ? '1 despesa' : `${total} despesas`)}
      emptyLabel="Nenhuma despesa neste mês."
      action={
        <Button title="Nova" onPress={() => navigation.navigate('ExpenseForm')} />
      }
      renderItem={(expense, { first, last }) => (
        <CardSegment first={first} last={last}>
          <ExpenseRow expense={expense} first={first} />
        </CardSegment>
      )}
    />
  );
}
