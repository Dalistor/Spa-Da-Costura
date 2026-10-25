import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { colors } from '../theme';

/** The beige ground of every screen, with faint threads and stitch lines drawn on it. */
export function ThreadBackground({ children }: { children: ReactNode }) {
  return (
    <ImageBackground
      source={require('./art/threads.png')}
      resizeMode="cover"
      style={styles.ground}
      accessibilityIgnoresInvertColors
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  ground: { flex: 1, backgroundColor: colors.background },
});
