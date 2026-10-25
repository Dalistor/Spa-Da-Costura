import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { Icon, type IconName } from '../../ui';

type Shortcut = {
  label: string;
  description: string;
  icon: IconName;
  /** A tab of the app, or the settings screen. */
  target: 'Customers' | 'Jobs' | 'CashFlow' | 'Catalog' | 'Settings';
};

const shortcuts: Shortcut[] = [
  {
    label: 'Clientes',
    description: 'Cadastro e medidas',
    icon: 'customers',
    target: 'Customers',
  },
  {
    label: 'Serviços',
    description: 'Consertos e entregas',
    icon: 'jobs',
    target: 'Jobs',
  },
  {
    label: 'Caixa',
    description: 'Entradas e despesas',
    icon: 'cashflow',
    target: 'CashFlow',
  },
  {
    label: 'Catálogo',
    description: 'Peças à venda',
    icon: 'catalog',
    target: 'Catalog',
  },
  {
    label: 'Ajustes',
    description: 'Backup e restauração',
    icon: 'settings',
    target: 'Settings',
  },
];

/** One button per area of the app, so every part is a tap away from home. */
export function SystemShortcuts() {
  const navigation = useNavigation();
  const open = ({ target }: Shortcut) =>
    target === 'Settings'
      ? navigation.navigate('Settings')
      : navigation.navigate('Tabs', { screen: target });
  return (
    <View style={styles.grid}>
      {shortcuts.map((shortcut, index) => (
        <Pressable
          key={shortcut.label}
          accessibilityRole="button"
          accessibilityLabel={`${shortcut.label}: ${shortcut.description}`}
          onPress={() => open(shortcut)}
          style={({ pressed }) => [
            styles.tile,
            // An odd last tile takes the whole row instead of leaving a gap.
            index === shortcuts.length - 1 && index % 2 === 0 && styles.wide,
            pressed && styles.pressed,
          ]}
        >
          <Icon name={shortcut.icon} color={colors.accent} size={26} />
          <View style={styles.text}>
            <Text style={styles.label}>{shortcut.label}</Text>
            <Text style={styles.description}>{shortcut.description}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const GAP = spacing.md - 4;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 112,
    padding: spacing.md,
    gap: spacing.md - 4,
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wide: {
    flexBasis: '100%',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  text: { gap: 2 },
  label: { ...typography.section, color: colors.textPrimary },
  description: { ...typography.caption, color: colors.textSecondary },
});
