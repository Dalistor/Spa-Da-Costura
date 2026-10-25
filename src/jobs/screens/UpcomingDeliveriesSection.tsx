import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { dayAndShortMonth, todayLocal } from '../../calendar';
import { colors, spacing, typography } from '../../theme';
import { Card, Pill, Section, useFocusedLoad } from '../../ui';
import { isLate, type JobListItem } from '../domain';
import { useJobRepository } from './JobRepository';

const SHOWN = 4;

/** The jobs still to deliver, nearest first, on the home screen. */
export function UpcomingDeliveriesSection() {
  const navigation = useNavigation();
  const repository = useJobRepository();
  const [data] = useFocusedLoad(
    useCallback(async () => {
      const jobs = await repository.listAll();
      return {
        today: todayLocal(),
        open: jobs.filter(job => job.status !== 'delivered'),
      };
    }, [repository]),
  );
  if (!data) {
    return null;
  }

  const ready = data.open.filter(job => job.status === 'ready').length;
  const late = data.open.filter(job => isLate(job, data.today)).length;
  const counts = [
    data.open.length === 1 ? '1 para entregar' : `${data.open.length} para entregar`,
    ready > 0 ? (ready === 1 ? '1 pronto' : `${ready} prontos`) : null,
    late > 0 ? (late === 1 ? '1 atrasado' : `${late} atrasados`) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Section
      title="Próximas entregas"
      action={{
        label: 'Ver todos',
        onPress: () => navigation.navigate('Tabs', { screen: 'Jobs' }),
      }}
    >
      <Card>
        <Text style={styles.counts}>
          {data.open.length === 0 ? 'Nenhum serviço para entregar' : counts}
        </Text>
        {data.open.slice(0, SHOWN).map(job => (
          <DeliveryRow
            key={job.id}
            job={job}
            late={isLate(job, data.today)}
            onPress={() => navigation.navigate('JobForm', { jobId: job.id })}
          />
        ))}
      </Card>
    </Section>
  );
}

function DeliveryRow({
  job,
  late,
  onPress,
}: {
  job: JobListItem;
  late: boolean;
  onPress: () => void;
}) {
  const { day, month } = dayAndShortMonth(job.deliveryDate);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Abre o serviço para editar"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.date}>
        <Text style={[styles.day, late && styles.lateText]}>{day}</Text>
        <Text style={styles.month}>{month}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.description} numberOfLines={1}>
          {job.description}
        </Text>
        <Text style={styles.customer} numberOfLines={1}>
          {job.customerName}
        </Text>
      </View>
      {late ? (
        <Pill label="Atrasado" tone="danger" />
      ) : job.status === 'ready' ? (
        <Pill label="Pronto" tone="accent" />
      ) : (
        <Pill label="Pendente" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  counts: {
    ...typography.caption,
    color: colors.textSecondary,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 4,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  date: { width: 40, alignItems: 'center' },
  day: { ...typography.figure, fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  lateText: { color: colors.danger },
  month: { fontSize: 12, color: colors.textSecondary },
  text: { flex: 1, gap: 2 },
  description: { ...typography.body, fontWeight: '500', color: colors.textPrimary },
  customer: { ...typography.caption, color: colors.textSecondary },
});
