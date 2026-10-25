import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button, EmptyState, TextField, useFocusedLoad } from '../../ui';
import { searchByName, type Customer } from '../domain';
import { useCustomerRepositories } from './CustomerRepositories';

export function CustomersScreen() {
  const navigation = useNavigation();
  const { customers: repository } = useCustomerRepositories();
  const [customers] = useFocusedLoad(
    useCallback(() => repository.list(), [repository]),
  );
  const [query, setQuery] = useState('');

  if (!customers) {
    return <View style={styles.screen} />;
  }

  const addCustomer = () => navigation.navigate('CustomerForm');

  if (customers.length === 0) {
    return (
      <View style={styles.screen}>
        <EmptyState
          title="Nenhum cliente ainda"
          message="Cadastre seu primeiro cliente para guardar medidas e histórico."
        />
        <View style={styles.footer}>
          <Button title="Novo cliente" onPress={addCustomer} />
        </View>
      </View>
    );
  }

  const found = searchByName(customers, query);
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TextField
          label="Buscar pelo nome"
          value={query}
          onChangeText={setQuery}
          placeholder="Ex.: Maria"
          autoCorrect={false}
        />
        <Button title="Novo cliente" onPress={addCustomer} />
      </View>
      <FlatList
        data={found}
        keyExtractor={customer => String(customer.id)}
        renderItem={({ item }) => (
          <CustomerRow
            customer={item}
            onPress={() =>
              navigation.navigate('CustomerDetail', { customerId: item.id })
            }
          />
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <Text style={styles.notFound}>
            Nenhum cliente encontrado para “{query.trim()}”.
          </Text>
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

function CustomerRow({
  customer,
  onPress,
}: {
  customer: Customer;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={styles.name}>{customer.name}</Text>
      {customer.phone ? (
        <Text style={styles.phone}>{customer.phone}</Text>
      ) : null}
    </Pressable>
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
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowPressed: { backgroundColor: colors.surfaceMuted },
  name: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  phone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  separator: { height: 1, backgroundColor: colors.border },
  notFound: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
});
