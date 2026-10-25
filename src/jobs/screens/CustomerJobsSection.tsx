import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button, useFocusedLoad } from '../../ui';
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
    <View>
      <Text style={styles.section}>Serviços</Text>
      <View style={styles.card}>
        {jobs && jobs.length === 0 ? (
          <Text style={styles.empty}>Nenhum serviço registrado.</Text>
        ) : null}
        {jobs?.map(job => (
          <Pressable
            key={job.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate('JobForm', { jobId: job.id })}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <JobSummary job={job} />
          </Pressable>
        ))}
        <Button
          title="Novo serviço"
          variant="secondary"
          onPress={() => navigation.navigate('JobForm', { customerId })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  row: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
});
