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
import type { JobError, JobInput, JobStatus } from '../domain';
import { useJobRepository } from './JobRepository';
import { jobErrorMessages } from './labels';
import { StatusSelector } from './StatusSelector';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'JobForm'>,
  'JobForm'
>;

export function JobFormScreen() {
  const navigation = useNavigation();
  const { customerId, jobId } = useRoute<Route>().params ?? {};
  const jobs = useJobRepository();
  const [form, setForm] = useState<JobInput>(() => ({
    description: '',
    amount: '',
    deliveryDate: todayLocal(),
  }));
  const [status, setStatus] = useState<JobStatus>('pending');
  const [error, setError] = useState<JobError>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: jobId ? 'Editar serviço' : 'Novo serviço' });
    if (!jobId) {
      return;
    }
    jobs.get(jobId).then(job => {
      if (job) {
        setForm({
          description: job.description,
          amount: formatCents(job.amountCents),
          deliveryDate: job.deliveryDate,
        });
        setStatus(job.status);
      }
    });
  }, [jobId, jobs, navigation]);

  const change = (field: keyof JobInput) => (value: string) => {
    setError(undefined);
    setForm(current => ({ ...current, [field]: value }));
  };

  const save = async () => {
    setSaving(true);
    const result = jobId
      ? await jobs.update(jobId, form)
      : customerId
      ? await jobs.create(customerId, form)
      : null;
    if (result?.ok && jobId) {
      await jobs.setStatus(jobId, status);
    }
    setSaving(false);
    if (result && !result.ok) {
      setError(result.error);
      return;
    }
    navigation.goBack();
  };

  const confirmRemoval = () =>
    Alert.alert('Excluir serviço', `Excluir "${form.description}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (jobId) {
            await jobs.remove(jobId);
          }
          navigation.goBack();
        },
      },
    ]);

  const messageFor = (field: JobError) =>
    error === field ? jobErrorMessages[field] : undefined;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextField
        label="Descrição *"
        placeholder="Ex.: Barra da calça"
        value={form.description}
        onChangeText={change('description')}
        error={messageFor('description-required')}
        autoCapitalize="sentences"
      />
      <TextField
        label="Valor (R$) *"
        placeholder="Ex.: 25,00"
        value={form.amount}
        onChangeText={change('amount')}
        error={messageFor('amount-invalid')}
        keyboardType="decimal-pad"
      />
      <DateField
        label="Data de entrega"
        value={form.deliveryDate}
        onChange={change('deliveryDate')}
      />
      {jobId ? (
        <View style={styles.status}>
          <Text style={styles.label}>Status</Text>
          <StatusSelector value={status} onChange={setStatus} />
        </View>
      ) : null}
      {error === 'not-found' || error === 'date-invalid' ? (
        <Text style={styles.error}>{jobErrorMessages[error]}</Text>
      ) : null}
      <Button title="Salvar" onPress={save} disabled={saving} />
      {jobId ? (
        <View style={styles.danger}>
          <Button
            title="Excluir serviço"
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
  content: { padding: spacing.md },
  status: { marginBottom: spacing.lg },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  danger: { marginTop: spacing.xl },
});
