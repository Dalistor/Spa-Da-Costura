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
import { useProductRepositories } from './ProductRepositories';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'CustomerSales'>,
  'CustomerSales'
>;

/** Every product sold to one customer, searchable by product, amount or date. */
export function CustomerSalesScreen() {
  const navigation = useNavigation();
  const { customerId } = useRoute<Route>().params;
  const { sales } = useProductRepositories();
  const load = useCallback(
    (search: ListSearch, page: PageRequest) =>
      sales.searchForCustomer(customerId, search, page),
    [customerId, sales],
  );

  return (
    <PagedList
      load={load}
      keyOf={sale => String(sale.id)}
      placeholder="Buscar produto, valor ou data"
      countLabel={total => (total === 1 ? '1 venda' : `${total} vendas`)}
      emptyLabel="Nenhum produto vendido."
      action={
        <Button
          title="Nova"
          onPress={() => navigation.navigate('ProductSaleForm', { customerId })}
        />
      }
      renderItem={(sale, { first, last }) => (
        <CardSegment first={first} last={last}>
          <ListRow
            first={first}
            title={sale.productName}
            subtitle={formatBusinessDate(sale.date)}
            trailing={<RowFigure>{formatCents(sale.amountCents)}</RowFigure>}
            accessibilityHint="Abre a venda para editar ou excluir"
            onPress={() =>
              navigation.navigate('ProductSaleForm', {
                customerId,
                saleId: sale.id,
              })
            }
          />
        </CardSegment>
      )}
    />
  );
}
