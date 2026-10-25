import { ScrollView, StyleSheet, View } from 'react-native';
import { AmountsDueSection, CurrentMonthPanel } from '../../finance';
import { UpcomingDeliveriesSection } from '../../jobs';
import { colors, spacing } from '../../theme';

/** The atelier at a glance: the month's balance, what is due to deliver and who owes. */
export function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View>
        <CurrentMonthPanel />
      </View>
      <UpcomingDeliveriesSection />
      <AmountsDueSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
});
