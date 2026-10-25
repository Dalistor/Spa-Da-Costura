import { StyleSheet, Text, View } from 'react-native';
import { formatBusinessDate } from '../../calendar';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import { Pill } from '../../ui';
import type { Job, JobStatus } from '../domain';
import { statusLabels } from './labels';

const statusTones = {
  pending: 'neutral',
  ready: 'accent',
  delivered: 'quiet',
} as const satisfies Record<JobStatus, 'neutral' | 'accent' | 'quiet'>;

/** Delivery date, description, amount and status of one job. */
export function JobSummary({
  job,
  customerName,
}: {
  job: Job;
  customerName?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        {customerName ? (
          <Text style={styles.customer} numberOfLines={1}>
            {customerName}
          </Text>
        ) : null}
        <Text style={styles.description}>{job.description}</Text>
        <Text style={styles.muted}>
          Entrega {formatBusinessDate(job.deliveryDate)}
        </Text>
      </View>
      <View style={styles.side}>
        <Text style={styles.amount}>{formatCents(job.amountCents)}</Text>
        <Pill label={statusLabels[job.status]} tone={statusTones[job.status]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  text: { flex: 1, gap: 3 },
  customer: { ...typography.caption, fontWeight: '600', color: colors.accentInk },
  description: { ...typography.body, fontWeight: '500', color: colors.textPrimary },
  muted: { ...typography.caption, color: colors.textSecondary },
  side: { alignItems: 'flex-end', gap: spacing.sm - 2 },
  amount: { ...typography.figure, color: colors.textPrimary },
});
