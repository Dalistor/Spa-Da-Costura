import { StyleSheet, Text, View } from 'react-native';
import { formatBusinessDate } from '../../calendar';
import { formatCents } from '../../money';
import { colors, spacing, typography } from '../../theme';
import type { Job } from '../domain';
import { statusLabels } from './labels';

/** Delivery date, description, amount and status of one job. */
export function JobSummary({
  job,
  customerName,
}: {
  job: Job;
  customerName?: string;
}) {
  return (
    <View>
      {customerName ? (
        <Text style={styles.customer}>{customerName}</Text>
      ) : null}
      <View style={styles.line}>
        <Text style={styles.description}>{job.description}</Text>
        <Text style={styles.amount}>{formatCents(job.amountCents)}</Text>
      </View>
      <View style={styles.line}>
        <Text style={styles.muted}>
          Entrega {formatBusinessDate(job.deliveryDate)}
        </Text>
        <Text style={[styles.status, styles[job.status]]}>
          {statusLabels[job.status]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  customer: { ...typography.caption, fontWeight: '600', color: colors.accent },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: { ...typography.body, color: colors.textPrimary, flexShrink: 1 },
  amount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  muted: { ...typography.caption, color: colors.textSecondary },
  status: {
    ...typography.caption,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  pending: { color: colors.textPrimary, backgroundColor: colors.surfaceMuted },
  ready: { color: colors.onAccent, backgroundColor: colors.accent },
  delivered: {
    color: colors.textSecondary,
    backgroundColor: colors.background,
  },
});
