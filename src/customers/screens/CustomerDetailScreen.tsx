import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button, EmptyState } from '../../ui';
import type { Measurement } from '../domain';
import { useCustomerRepositories } from './CustomerRepositories';
import { useFocusedLoad } from './useFocusedLoad';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'CustomerDetail'>,
  'CustomerDetail'
>;

export function CustomerDetailScreen() {
  const navigation = useNavigation();
  const { customerId } = useRoute<Route>().params;
  const { customers, measurements } = useCustomerRepositories();
  // Bumped after changes made on this screen, which do not trigger a refocus.
  const [revision, setRevision] = useState(0);
  const detail = useFocusedLoad(
    useCallback(async () => {
      const customer = await customers.get(customerId);
      return {
        customer,
        measurements: customer ? await measurements.listFor(customerId) : [],
        revision,
      };
    }, [customerId, customers, measurements, revision]),
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
            setRevision(current => current + 1);
          },
        },
      ],
    );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.name}>{customer.name}</Text>
        <Info label="Telefone" value={customer.phone} />
        <Info label="Descrição" value={customer.description} />
        <Button
          title="Editar dados"
          variant="secondary"
          onPress={() => navigation.navigate('CustomerForm', { customerId })}
        />
      </View>

      <Text style={styles.section}>Medidas</Text>
      <View style={styles.card}>
        {detail.measurements.length === 0 ? (
          <Text style={[styles.muted, styles.spaced]}>
            Nenhuma medida registrada.
          </Text>
        ) : (
          <>
            {detail.measurements.map(measurement => (
              <Pressable
                key={measurement.id}
                accessibilityRole="button"
                accessibilityHint="Toque para editar; toque e segure para remover"
                onPress={() => editMeasurement(measurement)}
                onLongPress={() => confirmRemoval(measurement)}
                style={({ pressed }) => [
                  styles.measurement,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.measurementKey}>{measurement.key}</Text>
                <Text style={styles.measurementValue}>{measurement.value}</Text>
              </Pressable>
            ))}
            <Text style={[styles.hint, styles.spaced]}>
              Toque para editar. Toque e segure para remover.
            </Text>
          </>
        )}
        <Button
          title="Adicionar medida"
          variant="secondary"
          onPress={() => navigation.navigate('MeasurementForm', { customerId })}
        />
      </View>

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

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={value ? styles.infoValue : styles.muted}>
        {value ?? 'Não informado'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  info: { marginBottom: spacing.md },
  infoLabel: { ...typography.caption, color: colors.textSecondary },
  infoValue: { ...typography.body, color: colors.textPrimary },
  muted: { ...typography.body, color: colors.textSecondary },
  spaced: { marginVertical: spacing.sm },
  hint: { ...typography.caption, color: colors.textSecondary },
  dangerZone: { marginTop: spacing.xl },
  section: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  measurement: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  measurementKey: {
    ...typography.body,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  measurementValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
});
