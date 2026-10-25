import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../theme';
import { Card, EmptyState, useFocusedLoad } from '../../ui';
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
        message="Para criar um serviço, abra a ficha do cliente e toque em Novo serviço."
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
        <Card style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Abre o serviço para editar ou excluir"
            onPress={() => navigation.navigate('JobForm', { jobId: item.id })}
            style={({ pressed }) => [styles.summary, pressed && styles.pressed]}
          >
            <JobSummary job={item} customerName={item.customerName} />
          </Pressable>
          <View style={styles.status}>
            <StatusSelector
              value={item.status}
              onChange={status => changeStatus(item, status)}
            />
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    gap: spacing.md - 4,
  },
  card: { paddingBottom: spacing.md },
  summary: { padding: spacing.md },
  pressed: { backgroundColor: colors.surfaceMuted },
  status: { paddingHorizontal: spacing.md },
});
