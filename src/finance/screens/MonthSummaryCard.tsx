import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCents, type Cents } from '../../money';
import { colors, radius, spacing, typography } from '../../theme';
import type { CashFlowSummary } from '../domain';

type Props = {
  label: string;
  summary: CashFlowSummary;
  /** When given, the whole card opens the cash flow. */
  onPress?: () => void;
};

/** The month's balance in large figures, with income and expenses under it. */
export function MonthSummaryCard({ label, summary, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={onPress ? 'Abre o caixa do mês' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.balance} adjustsFontSizeToFit numberOfLines={1}>
        {formatCents(summary.balanceCents)}
      </Text>
      <View style={styles.flows}>
        <Flow label="Entradas" cents={summary.incomeCents} />
        <Flow label="Saídas" cents={summary.expensesCents} />
      </View>
    </Pressable>
  );
}

function Flow({ label, cents }: { label: string; cents: Cents }) {
  return (
    <View style={styles.flow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.flowValue} adjustsFontSizeToFit numberOfLines={1}>
        {formatCents(cents)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.card,
    padding: spacing.gutter,
    gap: spacing.xs,
  },
  pressed: { opacity: 0.9 },
  label: { fontSize: 14, color: colors.thread },
  balance: {
    ...typography.figure,
    fontSize: 36,
    fontWeight: '700',
    color: colors.onAccent,
  },
  flows: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.md },
  flow: { flex: 1, gap: 2 },
  flowValue: { ...typography.figure, fontSize: 18, color: colors.onAccent },
});
