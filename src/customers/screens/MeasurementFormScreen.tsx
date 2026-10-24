import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import { Button, TextField } from '../../ui';
import type { MeasurementError, MeasurementInput } from '../domain';
import { useCustomerRepositories } from './CustomerRepositories';
import { measurementErrorMessages } from './messages';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'MeasurementForm'>,
  'MeasurementForm'
>;

export function MeasurementFormScreen() {
  const navigation = useNavigation();
  const { customerId, measurementId } = useRoute<Route>().params;
  const { measurements } = useCustomerRepositories();
  const [form, setForm] = useState<MeasurementInput>({ key: '', value: '' });
  const [error, setError] = useState<MeasurementError>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: measurementId ? 'Editar medida' : 'Nova medida',
    });
    if (!measurementId) {
      return;
    }
    measurements.get(measurementId).then(measurement => {
      if (measurement) {
        setForm({ key: measurement.key, value: measurement.value });
      }
    });
  }, [measurementId, measurements, navigation]);

  const save = async () => {
    setSaving(true);
    const result = measurementId
      ? await measurements.update(measurementId, form)
      : await measurements.add(customerId, form);
    setSaving(false);
    if (result.ok) {
      navigation.goBack();
    } else {
      setError(result.error);
    }
  };

  const keyError =
    error === 'key-required' || error === 'key-taken' ? error : undefined;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextField
        label="Medida *"
        placeholder="Ex.: Cintura"
        value={form.key}
        onChangeText={key => {
          setError(undefined);
          setForm(current => ({ ...current, key }));
        }}
        error={keyError && measurementErrorMessages[keyError]}
        autoCapitalize="sentences"
      />
      <TextField
        label="Valor"
        placeholder="Ex.: 72 cm"
        value={form.value}
        onChangeText={value => setForm(current => ({ ...current, value }))}
        error={
          error === 'not-found' ? measurementErrorMessages[error] : undefined
        }
      />
      <Button title="Salvar" onPress={save} disabled={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
});
