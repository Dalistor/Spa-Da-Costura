import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button, Card, EmptyState, Section, useFocusedLoad } from '../../ui';
import { CustomerBalanceSection, CustomerPaymentsSection } from '../../finance';
import { CustomerJobsSection } from '../../jobs';
import { CustomerProductSalesSection } from '../../products';
import type { Measurement } from '../domain';
import { useCustomerRepositories } from './CustomerRepositories';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'CustomerDetail'>,
  'CustomerDetail'
>;

export function CustomerDetailScreen() {
  const navigation = useNavigation();
  const { customerId } = useRoute<Route>().params;
  const { customers, measurements } = useCustomerRepositories();
  const [detail, reload] = useFocusedLoad(
    useCallback(async () => {
      const customer = await customers.get(customerId);
      return {
        customer,
        measurements: customer ? await measurements.listFor(customerId) : [],
      };
    }, [customerId, customers, measurements]),
  );

  useEffect(() => {
    if (detail?.customer) {
      navigation.setOptions({ title: detail.customer.name });
    }
  }, [detail, navigation]);

  if (!detail) {
    return <View style={styles.screen} />;
  }
  const { customer } = detail;
  if (!customer) {
    return (
      <EmptyState
        title="Cliente não encontrado"
        message="O cliente pode ter sido excluído."
      />
    );
  }

  const editMeasurement = (measurement: Measurement) =>
    navigation.navigate('MeasurementForm', {
      customerId,
      measurementId: measurement.id,
    });
  const confirmDeletion = () =>
    Alert.alert(
      'Excluir cliente',
      `Excluir ${customer.name}? O cliente e as medidas deixam de aparecer no app; os pagamentos continuam no caixa.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await customers.remove(customerId);
            navigation.goBack();
          },
        },
      ],
    );
  const confirmRemoval = (measurement: Measurement) =>
    Alert.alert(
      'Remover medida',
      `Remover "${measurement.key}" deste cliente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await measurements.remove(measurement.id);
            await reload();
          },
        },
      ],
    );

  const contact = [customer.phone, customer.description]
    .filter(Boolean)
    .join(' · ');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.identity}>
        <View style={styles.identityText}>
          <Text accessibilityRole="header" style={styles.name}>
            {customer.name}
          </Text>
          <Text style={styles.contact}>
            {contact || 'Sem telefone nem descrição'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar dados do cliente"
          onPress={() => navigation.navigate('CustomerForm', { customerId })}
          style={({ pressed }) => [styles.edit, pressed && styles.pressed]}
        >
          <Text style={styles.editLabel}>Editar</Text>
        </Pressable>
      </View>
      <CustomerBalanceSection customerId={customerId} />

      <Section
        title="Medidas"
        action={{
          label: 'Adicionar',
          onPress: () => navigation.navigate('MeasurementForm', { customerId }),
        }}
      >
        <Card>
          {detail.measurements.length === 0 ? (
            <Text style={styles.empty}>Nenhuma medida registrada.</Text>
          ) : (
            <View style={styles.measurements}>
              {detail.measurements.map((measurement, index) => (
                <Pressable
                  key={measurement.id}
                  accessibilityRole="button"
                  accessibilityHint="Toque para editar; toque e segure para remover"
                  onPress={() => editMeasurement(measurement)}
                  onLongPress={() => confirmRemoval(measurement)}
                  style={({ pressed }) => [
                    styles.measurement,
                    index >= 2 && styles.ruled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.measurementKey} numberOfLines={1}>
                    {measurement.key}
                  </Text>
                  <Text style={styles.measurementValue}>
                    {measurement.value}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Card>
        {detail.measurements.length > 0 ? (
          <Text style={styles.hint}>
            Toque para editar. Toque e segure para remover.
          </Text>
        ) : null}
      </Section>

      <CustomerJobsSection customerId={customerId} />
      <CustomerProductSalesSection customerId={customerId} />
      <CustomerPaymentsSection customerId={customerId} />

      <View style={styles.dangerZone}>
        <Button
          title="Excluir cliente"
          variant="danger"
          onPress={confirmDeletion}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  identityText: { flex: 1, gap: spacing.xs },
  name: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  contact: { fontSize: 15, color: colors.textSecondary },
  edit: { minHeight: 44, justifyContent: 'center' },
  editLabel: { fontSize: 15, fontWeight: '600', color: colors.accent },
  pressed: { opacity: 0.6 },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.md,
  },
  measurements: { flexDirection: 'row', flexWrap: 'wrap' },
  measurement: {
    width: '50%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 4,
    gap: 2,
  },
  ruled: { borderTopWidth: 1, borderTopColor: colors.rule },
  measurementKey: { ...typography.caption, color: colors.textSecondary },
  measurementValue: {
    ...typography.figure,
    fontSize: 17,
    color: colors.textPrimary,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  dangerZone: { marginTop: spacing.xl + spacing.md },
});
