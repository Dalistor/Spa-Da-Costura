import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import { formatBusinessDate } from '../../calendar';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import {
  Card,
  ListRow,
  RowFigure,
  SeeAllRow,
  Section,
  useFocusedLoad,
} from '../../ui';
import { useProductRepositories } from './ProductRepositories';

const SHOWN = 3;

/** The latest products sold to the customer, shown inside the customer detail. */
export function CustomerProductSalesSection({
  customerId,
}: {
  customerId: number;
}) {
  const navigation = useNavigation();
  const { sales: repository } = useProductRepositories();
  const [latest] = useFocusedLoad(
    useCallback(
      () =>
        repository.searchForCustomer(
          customerId,
          { kind: 'all' },
          { offset: 0, limit: SHOWN },
        ),
      [customerId, repository],
    ),
  );

  return (
    <Section
      title="Produtos vendidos"
      action={{
        label: 'Nova venda',
        onPress: () => navigation.navigate('ProductSaleForm', { customerId }),
      }}
    >
      <Card>
        {latest && latest.total === 0 ? (
          <Text style={styles.empty}>Nenhum produto vendido.</Text>
        ) : null}
        {latest?.items.map((sale, index) => (
          <ListRow
            key={sale.id}
            first={index === 0}
            title={sale.productName}
            subtitle={formatBusinessDate(sale.date)}
            trailing={<RowFigure>{formatCents(sale.amountCents)}</RowFigure>}
            accessibilityHint="Abre a venda para editar ou excluir"
            onPress={() =>
              navigation.navigate('ProductSaleForm', {
                customerId,
                saleId: sale.id,
              })
            }
          />
        ))}
        {latest && latest.total > SHOWN ? (
          <SeeAllRow
            label={`Ver todas as ${latest.total} vendas`}
            onPress={() => navigation.navigate('CustomerSales', { customerId })}
          />
        ) : null}
      </Card>
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.md,
  },
});
