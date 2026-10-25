import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Button, EmptyState, useFocusedLoad } from '../../ui';
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
    <View style={styles.screen}>
      <View style={styles.header}>
        <Button title="Novo produto" onPress={addProduct} />
      </View>
      <FlatList
        data={products}
        keyExtractor={product => String(product.id)}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Abre o produto para editar ou excluir"
            onPress={() =>
              navigation.navigate('ProductForm', { productId: item.id })
            }
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{formatCents(item.priceCents)}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={Separator}
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, paddingBottom: spacing.sm },
  footer: { padding: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  name: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  price: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  separator: { height: 1, backgroundColor: colors.border },
});
