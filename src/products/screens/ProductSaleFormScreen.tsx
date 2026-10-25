import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { todayLocal } from '../../calendar';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import {
  Button,
  DateField,
  EmptyState,
  TextField,
  useFocusedLoad,
} from '../../ui';
import type { Product, ProductSaleError, ProductSaleInput } from '../domain';
import { saleErrorMessages } from './labels';
import { ProductPicker } from './ProductPicker';
import { useProductRepositories } from './ProductRepositories';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'ProductSaleForm'>,
  'ProductSaleForm'
>;

export function ProductSaleFormScreen() {
  const navigation = useNavigation();
  const { customerId, saleId } = useRoute<Route>().params;
  const { products, sales } = useProductRepositories();
  const [catalog] = useFocusedLoad(
    useCallback(() => products.list(), [products]),
  );
  const [form, setForm] = useState<ProductSaleInput>(() => ({
    productId: null,
    amount: '',
    date: todayLocal(),
  }));
  const [savedName, setSavedName] = useState<string>();
  const [error, setError] = useState<ProductSaleError>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: saleId ? 'Editar venda' : 'Vender produto' });
    if (!saleId) {
      return;
    }
    sales.get(saleId).then(sale => {
      if (sale) {
        setForm({
          productId: sale.productId,
          amount: formatCents(sale.amountCents),
          date: sale.date,
        });
        setSavedName(sale.productName);
      }
    });
  }, [saleId, sales, navigation]);

  if (!catalog) {
    return <View style={styles.screen} />;
  }
  if (!saleId && catalog.length === 0) {
    return (
      <View style={styles.screen}>
        <EmptyState
          title="Catálogo vazio"
          message="Cadastre um produto no catálogo para poder vendê-lo."
        />
        <View style={styles.footer}>
          <Button
            title="Cadastrar produto"
            onPress={() => navigation.navigate('ProductForm')}
          />
        </View>
      </View>
    );
  }

  // Picking a product fills the amount with its price; the typed amount is what gets saved.
  const select = (product: Product) => {
    setError(undefined);
    setForm(current => ({
      ...current,
      productId: product.id,
      amount: formatCents(product.priceCents),
    }));
  };

  const change = (field: 'amount' | 'date') => (value: string) => {
    setError(undefined);
    setForm(current => ({ ...current, [field]: value }));
  };

  const save = async () => {
    setSaving(true);
    const result = saleId
      ? await sales.update(saleId, form)
      : await sales.create(customerId, form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigation.goBack();
  };

  const confirmRemoval = () =>
    Alert.alert('Excluir venda', `Excluir a venda de "${savedName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (saleId) {
            await sales.remove(saleId);
          }
          navigation.goBack();
        },
      },
    ]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Produto *</Text>
      <ProductPicker
        products={catalog}
        selectedId={form.productId}
        removedName={savedName}
        onSelect={select}
      />
      {error === 'product-required' ? (
        <Text style={styles.error}>{saleErrorMessages[error]}</Text>
      ) : null}
      <View style={styles.fields}>
        <TextField
          label="Valor (R$) *"
          placeholder="Escolha o produto"
          value={form.amount}
          onChangeText={change('amount')}
          error={
            error === 'amount-invalid' ? saleErrorMessages[error] : undefined
          }
          keyboardType="decimal-pad"
        />
        <DateField
          label="Data da venda"
          value={form.date}
          onChange={change('date')}
        />
      </View>
      {error === 'not-found' || error === 'date-invalid' ? (
        <Text style={styles.error}>{saleErrorMessages[error]}</Text>
      ) : null}
      <Button title="Salvar" onPress={save} disabled={saving} />
      {saleId ? (
        <View style={styles.danger}>
          <Button
            title="Excluir venda"
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
  content: { padding: spacing.gutter, gap: spacing.xs },
  footer: { padding: spacing.gutter },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fields: { marginTop: spacing.lg },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginVertical: spacing.sm,
  },
  danger: { marginTop: spacing.xl },
});
