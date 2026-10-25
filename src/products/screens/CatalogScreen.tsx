import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { formatCents } from '../../money';
import { pageOf, type ListSearch, type PageRequest } from '../../search';
import {
  Button,
  CardSegment,
  EmptyState,
  ListRow,
  PagedList,
  RowFigure,
} from '../../ui';
import { searchProducts } from '../domain';
import { useProductRepositories } from './ProductRepositories';

/** The catalog by name, searchable by name or price. */
export function CatalogScreen() {
  const navigation = useNavigation();
  const { products: repository } = useProductRepositories();
  // Read whole and sorted with accents in mind, then shown a page at a time.
  const load = useCallback(
    async (_search: ListSearch, page: PageRequest, typed: string) =>
      pageOf(searchProducts(await repository.list(), typed), page),
    [repository],
  );

  return (
    <PagedList
      load={load}
      keyOf={product => String(product.id)}
      placeholder="Buscar por nome ou preço"
      countLabel={total => (total === 1 ? '1 peça' : `${total} peças`)}
      emptyLabel="Catálogo vazio."
      emptyView={
        <EmptyState
          title="Catálogo vazio"
          message="Toque em Novo para cadastrar as peças que você vende, com nome e preço."
        />
      }
      action={
        <Button title="Novo" onPress={() => navigation.navigate('ProductForm')} />
      }
      renderItem={(product, { first, last }) => (
        <CardSegment first={first} last={last}>
          <ListRow
            first={first}
            title={product.name}
            trailing={<RowFigure>{formatCents(product.priceCents)}</RowFigure>}
            accessibilityHint="Abre o produto para editar ou excluir"
            onPress={() =>
              navigation.navigate('ProductForm', { productId: product.id })
            }
          />
        </CardSegment>
      )}
    />
  );
}
