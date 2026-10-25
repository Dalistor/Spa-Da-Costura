import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { ListSearch, PageRequest } from '../../search';
import { colors, spacing } from '../../theme';
import { Button, CardSegment, PagedList } from '../../ui';
import { useJobRepository } from './JobRepository';
import { JobSummary } from './JobSummary';

type Route = RouteProp<
  Pick<ReactNavigation.RootParamList, 'CustomerJobs'>,
  'CustomerJobs'
>;

/** Every job of one customer, searchable by description, amount or date. */
export function CustomerJobsScreen() {
  const navigation = useNavigation();
  const { customerId } = useRoute<Route>().params;
  const repository = useJobRepository();
  const load = useCallback(
    (search: ListSearch, page: PageRequest) =>
      repository.searchForCustomer(customerId, search, page),
    [customerId, repository],
  );

  return (
    <PagedList
      load={load}
      keyOf={job => String(job.id)}
      placeholder="Buscar serviço, valor ou data"
      countLabel={total => (total === 1 ? '1 serviço' : `${total} serviços`)}
      emptyLabel="Nenhum serviço registrado."
      action={
        <Button
          title="Novo"
          onPress={() => navigation.navigate('JobForm', { customerId })}
        />
      }
      renderItem={(job, { first, last }) => (
        <CardSegment first={first} last={last}>
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Abre o serviço para editar ou excluir"
            onPress={() => navigation.navigate('JobForm', { jobId: job.id })}
            style={({ pressed }) => [
              styles.row,
              !first && styles.ruled,
              pressed && styles.pressed,
            ]}
          >
            <JobSummary job={job} />
          </Pressable>
        </CardSegment>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { padding: spacing.md },
  ruled: { borderTopWidth: 1, borderTopColor: colors.rule },
  pressed: { backgroundColor: colors.surfaceMuted },
});
