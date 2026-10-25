import {
  StackActions,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { spacing } from '../../theme';
import { Button, TextField } from '../../ui';
import type { CustomerInput } from '../domain';
import { useCustomerRepositories } from './CustomerRepositories';
import { customerErrorMessages } from './messages';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'CustomerForm'>,
  'CustomerForm'
>;

export function CustomerFormScreen() {
  const navigation = useNavigation();
  const customerId = useRoute<Route>().params?.customerId;
  const { customers } = useCustomerRepositories();
  const [form, setForm] = useState<Required<CustomerInput>>({
    name: '',
    phone: '',
    description: '',
  });
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: customerId ? 'Editar cliente' : 'Novo cliente',
    });
    if (!customerId) {
      return;
    }
    customers.get(customerId).then(customer => {
      if (customer) {
        setForm({
          name: customer.name,
          phone: customer.phone ?? '',
          description: customer.description ?? '',
        });
      }
    });
  }, [customerId, customers, navigation]);

  const change = (field: keyof CustomerInput) => (text: string) =>
    setForm(current => ({ ...current, [field]: text }));

  const save = async () => {
    setSaving(true);
    const result = customerId
      ? await customers.update(customerId, form)
      : await customers.create(form);
    setSaving(false);
    if (!result.ok) {
      setError(customerErrorMessages[result.error]);
      return;
    }
    if (customerId) {
      navigation.goBack();
    } else {
      // Replaces the form so "back" from the new customer returns to the list.
      navigation.dispatch(
        StackActions.replace('CustomerDetail', {
          customerId: result.customer.id,
        }),
      );
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextField
        label="Nome *"
        value={form.name}
        onChangeText={text => {
          setError(undefined);
          change('name')(text);
        }}
        error={error}
        autoCapitalize="words"
      />
      <TextField
        label="Telefone"
        value={form.phone}
        onChangeText={change('phone')}
        keyboardType="phone-pad"
      />
      <TextField
        label="Descrição"
        value={form.description}
        onChangeText={change('description')}
        multiline
      />
      <Button title="Salvar" onPress={save} disabled={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.gutter, gap: spacing.xs },
});
