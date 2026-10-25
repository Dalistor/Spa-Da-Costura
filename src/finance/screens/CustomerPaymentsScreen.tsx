import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useCallback } from 'react';
import { formatBusinessDate } from '../../calendar';
import { formatCents } from '../../money';
import type { ListSearch, PageRequest } from '../../search';
import { Button, CardSegment, ListRow, PagedList, RowFigure } from '../../ui';
import { useFinanceRepositories } from './FinanceRepositories';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'CustomerPayments'>,
  'CustomerPayments'
>;

/** Every payment of one customer, searchable by amount or date. */
export function CustomerPaymentsScreen() {
  const navigation = useNavigation();
  const { customerId } = useRoute<Route>().params;
  const { payments } = useFinanceRepositories();
  const load = useCallback(
    (search: ListSearch, page: PageRequest) =>
      payments.searchForCustomer(customerId, search, page),
    [customerId, payments],
  );

  return (
    <PagedList
      load={load}
      keyOf={payment => String(payment.id)}
      placeholder="Buscar por valor ou data"
      countLabel={total =>
        total === 1 ? '1 pagamento' : `${total} pagamentos`
      }
      emptyLabel="Nenhum pagamento registrado."
      action={
        <Button
          title="Novo"
          onPress={() => navigation.navigate('PaymentForm', { customerId })}
        />
      }
      renderItem={(payment, { first, last }) => (
        <CardSegment first={first} last={last}>
          <ListRow
            first={first}
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
        </CardSegment>
      )}
    />
  );
}
