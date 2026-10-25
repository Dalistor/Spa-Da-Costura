import { ScrollView, StyleSheet } from 'react-native';
import { AmountsDueSection } from '../../finance';
import { UpcomingDeliveriesSection } from '../../jobs';
import { spacing } from '../../theme';
import { SystemShortcuts } from './SystemShortcuts';

/** The way into every area of the app, with what is due to deliver and who owes. */
export function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SystemShortcuts />
      <UpcomingDeliveriesSection />
      <AmountsDueSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
});
