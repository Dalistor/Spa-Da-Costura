import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('');
}

/** The person's initials in a circle, so names in a list start on one edge. */
export function Avatar({ name }: { name: string }) {
  return (
    <View style={styles.circle} accessibilityElementsHidden>
      <Text style={styles.initials}>{initialsOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 15, fontWeight: '600', color: colors.accentInk },
});
