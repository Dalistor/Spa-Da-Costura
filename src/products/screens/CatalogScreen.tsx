import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import {
  Button,
  CardSegment,
  EmptyState,
  ListRow,
  RowFigure,
  useFocusedLoad,
} from '../../ui';
import { useProductRepositories } from './ProductRepositories';

export function CatalogScreen() {
  const navigation = useNavigation();
  const { products: repository } = useProductRepositories();
  const [products] = useFocusedLoad(
    useCallback(() => repository.list(), [repository]),
  );

  if (!products) {
    return <View style={styles.screen} />;
  }

  const addProduct = () => navigation.navigate('ProductForm');

  if (products.length === 0) {
    return (
      <View style={styles.screen}>
        <EmptyState
          title="Catálogo vazio"
          message="Cadastre as peças que você vende, com nome e preço."
        />
        <View style={styles.footer}>
          <Button title="Novo produto" onPress={addProduct} />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.list}
      data={products}
      keyExtractor={product => String(product.id)}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.count}>
            {products.length === 1 ? '1 peça' : `${products.length} peças`}
          </Text>
          <Button title="Novo produto" onPress={addProduct} />
        </View>
      }
      renderItem={({ item, index }) => (
        <CardSegment first={index === 0} last={index === products.length - 1}>
          <ListRow
            first={index === 0}
            title={item.name}
            trailing={<RowFigure>{formatCents(item.priceCents)}</RowFigure>}
            accessibilityHint="Abre o produto para editar ou excluir"
            onPress={() =>
              navigation.navigate('ProductForm', { productId: item.id })
            }
          />
        </CardSegment>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  footer: { padding: spacing.gutter },
  list: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  count: { ...typography.caption, color: colors.textSecondary },
});
