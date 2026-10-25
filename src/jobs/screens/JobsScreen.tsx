import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../theme';
import { EmptyState, useFocusedLoad } from '../../ui';
import type { JobListItem, JobStatus } from '../domain';
import { useJobRepository } from './JobRepository';
import { JobSummary } from './JobSummary';
import { StatusSelector } from './StatusSelector';

export function JobsScreen() {
  const navigation = useNavigation();
  const repository = useJobRepository();
  const [jobs, reload] = useFocusedLoad(
    useCallback(() => repository.listAll(), [repository]),
  );

  if (!jobs) {
    return <View style={styles.screen} />;
  }
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="Nenhum serviço ainda"
        message="Registre um serviço a partir do cadastro do cliente."
      />
    );
  }

  const changeStatus = async (job: JobListItem, status: JobStatus) => {
    await repository.setStatus(job.id, status);
    await reload();
  };

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={jobs}
      keyExtractor={job => String(job.id)}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Abre o serviço para editar ou excluir"
            onPress={() => navigation.navigate('JobForm', { jobId: item.id })}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <JobSummary job={item} customerName={item.customerName} />
          </Pressable>
          <View style={styles.status}>
            <StatusSelector
              value={item.status}
              onChange={status => changeStatus(item, status)}
            />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  pressed: { opacity: 0.6 },
  status: { marginTop: spacing.sm },
});
