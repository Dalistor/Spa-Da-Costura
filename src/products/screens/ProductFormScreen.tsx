import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Button, TextField } from '../../ui';
import type { ProductError, ProductInput } from '../domain';
import { productErrorMessages } from './labels';
import { useProductRepositories } from './ProductRepositories';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'ProductForm'>,
  'ProductForm'
>;

export function ProductFormScreen() {
  const navigation = useNavigation();
  const { productId } = useRoute<Route>().params ?? {};
  const { products } = useProductRepositories();
  const [form, setForm] = useState<ProductInput>({ name: '', price: '' });
  const [error, setError] = useState<ProductError>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: productId ? 'Editar produto' : 'Novo produto',
    });
    if (!productId) {
      return;
    }
    products.get(productId).then(product => {
      if (product) {
        setForm({ name: product.name, price: formatCents(product.priceCents) });
      }
    });
  }, [productId, products, navigation]);

  const change = (field: keyof ProductInput) => (value: string) => {
    setError(undefined);
    setForm(current => ({ ...current, [field]: value }));
  };

  const save = async () => {
    setSaving(true);
    const result = productId
      ? await products.update(productId, form)
      : await products.create(form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigation.goBack();
  };

  const confirmRemoval = () =>
    Alert.alert(
      'Excluir produto',
      `Excluir "${form.name}" do catálogo? As vendas já feitas continuam no histórico dos clientes.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (productId) {
              await products.remove(productId);
            }
            navigation.goBack();
          },
        },
      ],
    );

  const messageFor = (field: ProductError) =>
    error === field ? productErrorMessages[field] : undefined;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextField
        label="Nome *"
        placeholder="Ex.: Vestido de festa"
        value={form.name}
        onChangeText={change('name')}
        error={messageFor('name-required')}
        autoCapitalize="sentences"
      />
      <TextField
        label="Preço (R$) *"
        placeholder="Ex.: 350,00"
        value={form.price}
        onChangeText={change('price')}
        error={messageFor('price-invalid')}
        keyboardType="decimal-pad"
      />
      {error === 'not-found' ? (
        <Text style={styles.error}>{productErrorMessages[error]}</Text>
      ) : null}
      <Button title="Salvar" onPress={save} disabled={saving} />
      {productId ? (
        <View style={styles.danger}>
          <Button
            title="Excluir produto"
            variant="danger"
            onPress={confirmRemoval}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  danger: { marginTop: spacing.xl },
});
