import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { ListSearch, PageRequest } from '../../search';
import { colors, spacing } from '../../theme';
import { Card, PagedList } from '../../ui';
import type { JobListItem, JobStatus } from '../domain';
import { useJobRepository } from './JobRepository';
import { JobSummary } from './JobSummary';
import { StatusSelector } from './StatusSelector';

/** Every job, nearest delivery first, searchable by customer, description, amount or date. */
export function JobsScreen() {
  const navigation = useNavigation();
  const repository = useJobRepository();
  const reload = useRef<(() => Promise<void>) | null>(null);
  const load = useCallback(
    (search: ListSearch, page: PageRequest) => repository.search(search, page),
    [repository],
  );

  const changeStatus = async (job: JobListItem, status: JobStatus) => {
    await repository.setStatus(job.id, status);
    await reload.current?.();
  };

  return (
    <PagedList
      load={load}
      reloadRef={reload}
      gap={spacing.md - 4}
      keyOf={job => String(job.id)}
      placeholder="Buscar cliente, serviço, valor ou data"
      countLabel={total => (total === 1 ? '1 serviço' : `${total} serviços`)}
      emptyLabel="Nenhum serviço ainda. Para criar um, abra a ficha do cliente e toque em Novo serviço."
      renderItem={job => (
        <Card style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Abre o serviço para editar ou excluir"
            onPress={() => navigation.navigate('JobForm', { jobId: job.id })}
            style={({ pressed }) => [styles.summary, pressed && styles.pressed]}
          >
            <JobSummary job={job} customerName={job.customerName} />
          </Pressable>
          <View style={styles.status}>
            <StatusSelector
              value={job.status}
              onChange={status => changeStatus(job, status)}
            />
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { paddingBottom: spacing.md },
  summary: { padding: spacing.md },
  pressed: { backgroundColor: colors.surfaceMuted },
  status: { paddingHorizontal: spacing.md },
});
