import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { radius } from '../theme';

const sources = {
  /** A spool whose thread runs to a needle over a line of stitches. */
  spool: require('./art/spool.png'),
} as const;

const aspectRatios = { spool: 240 / 160 } as const;

/** A decorative drawing of the atelier's tools; hidden from screen readers. */
export function Artwork({
  name,
  style,
}: {
  name: keyof typeof sources;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={sources[name]}
      style={[styles.art, { aspectRatio: aspectRatios[name] }, style]}
      accessible={false}
      importantForAccessibility="no"
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  art: { width: '100%', height: undefined, borderRadius: radius.card },
});
