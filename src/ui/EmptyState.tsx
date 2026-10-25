import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { BrandMark } from './BrandMark';

type Props = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <BrandMark />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  mark: { opacity: 0.9, marginBottom: spacing.md },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    lineHeight: 23,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
});
