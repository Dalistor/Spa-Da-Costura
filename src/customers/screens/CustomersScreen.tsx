import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { pageOf, type ListSearch, type PageRequest } from '../../search';
import {
  Avatar,
  Button,
  CardSegment,
  Chevron,
  EmptyState,
  ListRow,
  PagedList,
} from '../../ui';
import { searchCustomers } from '../domain';
import { useCustomerRepositories } from './CustomerRepositories';

/** Every customer by name, searchable by name or phone. */
export function CustomersScreen() {
  const navigation = useNavigation();
  const { customers: repository } = useCustomerRepositories();
  // Names are few and short: they are read whole and sorted with accents in
  // mind (Érica among the E's), then shown a page at a time.
  const load = useCallback(
    async (_search: ListSearch, page: PageRequest, typed: string) =>
      pageOf(searchCustomers(await repository.list(), typed), page),
    [repository],
  );

  return (
    <PagedList
      load={load}
      keyOf={customer => String(customer.id)}
      placeholder="Buscar por nome ou telefone"
      countLabel={total => (total === 1 ? '1 cliente' : `${total} clientes`)}
      emptyLabel="Nenhum cliente ainda."
      emptyView={
        <EmptyState
          title="Nenhum cliente ainda"
          message="Toque em Novo para cadastrar o primeiro cliente e guardar medidas e histórico."
        />
      }
      action={
        <Button
          title="Novo"
          onPress={() => navigation.navigate('CustomerForm')}
        />
      }
      renderItem={(customer, { first, last }) => (
        <CardSegment first={first} last={last}>
          <ListRow
            first={first}
            title={customer.name}
            subtitle={customer.phone ?? 'Sem telefone'}
            leading={<Avatar name={customer.name} />}
            trailing={<Chevron />}
            onPress={() =>
              navigation.navigate('CustomerDetail', {
                customerId: customer.id,
              })
            }
          />
        </CardSegment>
      )}
    />
  );
}
