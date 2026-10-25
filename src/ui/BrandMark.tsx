import { Image, StyleSheet } from 'react-native';

/** The app's needle-and-thread mark, shown beside each tab's title. */
export function BrandMark() {
  return (
    <Image
      source={require('./brand-mark.png')}
      style={styles.mark}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  mark: { width: 34, height: 34 },
});
