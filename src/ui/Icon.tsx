import { Image, StyleSheet } from 'react-native';

const sources = {
  home: require('./icons/home.png'),
  customers: require('./icons/customers.png'),
  jobs: require('./icons/jobs.png'),
  cashflow: require('./icons/cashflow.png'),
  catalog: require('./icons/catalog.png'),
  settings: require('./icons/settings.png'),
} as const;

export type IconName = keyof typeof sources;

/** An outline icon from the app's one set, painted in the given color. */
export function Icon({
  name,
  color,
  size = 22,
}: {
  name: IconName;
  color: string;
  size?: number;
}) {
  return (
    <Image
      source={sources[name]}
      style={[styles.icon, { width: size, height: size, tintColor: color }]}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  icon: { resizeMode: 'contain' },
});
