import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Card, Section, useFocusedLoad } from '../../ui';
import { useJobRepository } from './JobRepository';
import { JobSummary } from './JobSummary';

/** The customer's jobs, shown inside the customer detail. */
export function CustomerJobsSection({ customerId }: { customerId: number }) {
  const navigation = useNavigation();
  const repository = useJobRepository();
  const [jobs] = useFocusedLoad(
    useCallback(
      () => repository.listForCustomer(customerId),
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
        {jobs && jobs.length === 0 ? (
          <Text style={styles.empty}>Nenhum serviço registrado.</Text>
        ) : null}
        {jobs?.map((job, index) => (
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
