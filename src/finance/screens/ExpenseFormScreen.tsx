import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { todayLocal } from '../../calendar';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Button, DateField, TextField } from '../../ui';
import type { ExpenseCategory, ExpenseError, ExpenseInput } from '../domain';
import { CategorySelector } from './CategorySelector';
import { useFinanceRepositories } from './FinanceRepositories';
import { expenseErrorMessages } from './labels';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'ExpenseForm'>,
  'ExpenseForm'
>;

export function ExpenseFormScreen() {
  const navigation = useNavigation();
  const expenseId = useRoute<Route>().params?.expenseId;
  const { expenses } = useFinanceRepositories();
  const [form, setForm] = useState<ExpenseInput>(() => ({
    description: '',
    category: null,
    amount: '',
    date: todayLocal(),
  }));
  const [error, setError] = useState<ExpenseError>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: expenseId ? 'Editar despesa' : 'Nova despesa',
    });
    if (!expenseId) {
      return;
    }
    expenses.get(expenseId).then(expense => {
      if (expense) {
        setForm({
          description: expense.description,
          category: expense.category,
          amount: formatCents(expense.amountCents),
          date: expense.date,
        });
      }
    });
  }, [expenseId, expenses, navigation]);

  const change =
    (field: Exclude<keyof ExpenseInput, 'category'>) => (value: string) => {
      setError(undefined);
      setForm(current => ({ ...current, [field]: value }));
    };

  const choose = (category: ExpenseCategory) => {
    setError(undefined);
    setForm(current => ({ ...current, category }));
  };

  const save = async () => {
    setSaving(true);
    const result = expenseId
      ? await expenses.update(expenseId, form)
      : await expenses.create(form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigation.goBack();
  };

  const confirmRemoval = () =>
    Alert.alert('Excluir despesa', `Excluir "${form.description}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (expenseId) {
            await expenses.remove(expenseId);
          }
          navigation.goBack();
        },
      },
    ]);

  const messageFor = (field: ExpenseError) =>
    error === field ? expenseErrorMessages[field] : undefined;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextField
        label="Descrição *"
        placeholder="Ex.: Linha e botões"
        value={form.description}
        onChangeText={change('description')}
        error={messageFor('description-required')}
      />
      <Text style={styles.label}>Categoria *</Text>
      <CategorySelector value={form.category} onChange={choose} />
      {error === 'category-required' ? (
        <Text style={styles.error}>{expenseErrorMessages[error]}</Text>
      ) : null}
      <View style={styles.fields}>
        <TextField
          label="Valor (R$) *"
          placeholder="35,00"
          value={form.amount}
          onChangeText={change('amount')}
          error={messageFor('amount-invalid')}
          keyboardType="decimal-pad"
        />
        <DateField
          label="Data da despesa"
          value={form.date}
          onChange={change('date')}
        />
      </View>
      {error === 'not-found' || error === 'date-invalid' ? (
        <Text style={styles.error}>{expenseErrorMessages[error]}</Text>
      ) : null}
      <Button title="Salvar" onPress={save} disabled={saving} />
      {expenseId ? (
        <View style={styles.danger}>
          <Button
            title="Excluir despesa"
            variant="danger"
            onPress={confirmRemoval}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.gutter, gap: spacing.xs },
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
