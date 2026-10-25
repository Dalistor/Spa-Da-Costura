import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { todayLocal } from '../../calendar';
import { formatCents, type Cents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Button, DateField, TextField } from '../../ui';
import {
  customerBalance,
  exceedsAmountDue,
  validatePayment,
  type PaymentError,
  type PaymentInput,
} from '../domain';
import { useFinanceRepositories } from './FinanceRepositories';
import { paymentErrorMessages } from './labels';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'PaymentForm'>,
  'PaymentForm'
>;

export function PaymentFormScreen() {
  const navigation = useNavigation();
  const { customerId, paymentId } = useRoute<Route>().params;
  const { payments } = useFinanceRepositories();
  const [form, setForm] = useState<PaymentInput>(() => ({
    amount: '',
    date: todayLocal(),
  }));
  const [savedCents, setSavedCents] = useState<Cents>(0);
  const [error, setError] = useState<PaymentError>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: paymentId ? 'Editar pagamento' : 'Novo pagamento',
    });
    if (!paymentId) {
      return;
    }
    payments.get(paymentId).then(payment => {
      if (payment) {
        setForm({
          amount: formatCents(payment.amountCents),
          date: payment.date,
        });
        setSavedCents(payment.amountCents);
      }
    });
  }, [paymentId, payments, navigation]);

  const change = (field: keyof PaymentInput) => (value: string) => {
    setError(undefined);
    setForm(current => ({ ...current, [field]: value }));
  };

  const persist = async () => {
    setSaving(true);
    const result = paymentId
      ? await payments.update(paymentId, form)
      : await payments.create(customerId, form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigation.goBack();
  };

  const save = async () => {
    const valid = validatePayment(form);
    if (!valid.ok) {
      setError(valid.error);
      return;
    }
    const totals = await payments.totalsFor(customerId);
    if (!exceedsAmountDue(totals, valid.payment.amountCents, savedCents)) {
      await persist();
      return;
    }
    const { amountDue } = customerBalance({
      ...totals,
      paidCents: totals.paidCents - savedCents,
    });
    Alert.alert(
      'Pagamento maior que a dívida',
      `O cliente está devendo ${formatCents(
        amountDue,
      )}. Com este pagamento, ele paga a mais e a diferença fica como saldo a favor. Salvar mesmo assim?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salvar', onPress: persist },
      ],
    );
  };

  const confirmRemoval = () =>
    Alert.alert(
      'Excluir pagamento',
      `Excluir o pagamento de ${formatCents(savedCents)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (paymentId) {
              await payments.remove(paymentId);
            }
            navigation.goBack();
          },
        },
      ],
    );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextField
        label="Valor (R$) *"
        placeholder="40,00"
        value={form.amount}
        onChangeText={change('amount')}
        error={
          error === 'amount-invalid' ? paymentErrorMessages[error] : undefined
        }
        keyboardType="decimal-pad"
      />
      <DateField
        label="Data do pagamento"
        value={form.date}
        onChange={change('date')}
      />
      {error === 'not-found' || error === 'date-invalid' ? (
        <Text style={styles.error}>{paymentErrorMessages[error]}</Text>
      ) : null}
      <Button title="Salvar" onPress={save} disabled={saving} />
      {paymentId ? (
        <View style={styles.danger}>
          <Button
            title="Excluir pagamento"
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
  error: {
    ...typography.caption,
    color: colors.danger,
    marginVertical: spacing.sm,
  },
  danger: { marginTop: spacing.xl },
});
