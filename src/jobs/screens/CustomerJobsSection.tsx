import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Card, SeeAllRow, Section, useFocusedLoad } from '../../ui';
import { useJobRepository } from './JobRepository';
import { JobSummary } from './JobSummary';

const SHOWN = 3;

/** The customer's nearest jobs, shown inside the customer detail. */
export function CustomerJobsSection({ customerId }: { customerId: number }) {
  const navigation = useNavigation();
  const repository = useJobRepository();
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
      title="Serviços"
      action={{
        label: 'Novo serviço',
        onPress: () => navigation.navigate('JobForm', { customerId }),
      }}
    >
      <Card>
        {latest && latest.total === 0 ? (
          <Text style={styles.empty}>Nenhum serviço registrado.</Text>
        ) : null}
        {latest?.items.map((job, index) => (
          <Pressable
            key={job.id}
            accessibilityRole="button"
            accessibilityHint="Abre o serviço para editar ou excluir"
            onPress={() => navigation.navigate('JobForm', { jobId: job.id })}
            style={({ pressed }) => [
              styles.row,
              index > 0 && styles.ruled,
              pressed && styles.pressed,
            ]}
          >
            <JobSummary job={job} />
          </Pressable>
        ))}
        {latest && latest.total > SHOWN ? (
          <SeeAllRow
            label={`Ver todos os ${latest.total} serviços`}
            onPress={() => navigation.navigate('CustomerJobs', { customerId })}
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
  row: { padding: spacing.md },
  ruled: { borderTopWidth: 1, borderTopColor: colors.rule },
  pressed: { backgroundColor: colors.surfaceMuted },
});
