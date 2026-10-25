import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import {
  Avatar,
  Button,
  CardSegment,
  Chevron,
  EmptyState,
  ListRow,
  useFocusedLoad,
} from '../../ui';
import { searchByName } from '../domain';
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
      <View style={styles.toolbar}>
        <TextInput
          accessibilityLabel="Buscar pelo nome"
          placeholder="Buscar pelo nome"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          style={styles.search}
        />
        <Button title="Novo" onPress={addCustomer} />
      </View>
      <FlatList
        data={found}
        keyExtractor={customer => String(customer.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.count}>
            {customers.length === 1 ? '1 cliente' : `${customers.length} clientes`}
          </Text>
        }
        renderItem={({ item, index }) => (
          <CardSegment first={index === 0} last={index === found.length - 1}>
            <ListRow
              first={index === 0}
              title={item.name}
              subtitle={item.phone ?? 'Sem telefone'}
              leading={<Avatar name={item.name} />}
              trailing={<Chevron />}
              onPress={() =>
                navigation.navigate('CustomerDetail', { customerId: item.id })
              }
            />
          </CardSegment>
        )}
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  search: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.control,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  footer: { padding: spacing.gutter },
  list: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl },
  count: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  notFound: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
});
