import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CashFlowScreen,
  ExpenseFormScreen,
  PaymentFormScreen,
} from '../../finance';
import {
  CatalogScreen,
  ProductFormScreen,
  ProductSaleFormScreen,
} from '../../products';
import {
  CustomerDetailScreen,
  CustomerFormScreen,
  CustomersScreen,
  MeasurementFormScreen,
} from '../../customers';
import { JobFormScreen, JobsScreen } from '../../jobs';
import { SettingsScreen } from '../../backup';
import { HomeScreen } from '../../home';
import { colors, radius, spacing, typography } from '../../theme';
import { BrandMark, Icon, type IconName } from '../../ui';
import { StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList, TabParamList } from './routes';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.danger,
  },
};

/** The tab bar's icon renderer for one tab, defined once outside render. */
function tabIcon(name: IconName) {
  return ({ focused }: { focused: boolean }) => (
    <TabIcon name={name} focused={focused} />
  );
}

const tabIcons = {
  Home: tabIcon('home'),
  Customers: tabIcon('customers'),
  Jobs: tabIcon('jobs'),
  CashFlow: tabIcon('cashflow'),
  Catalog: tabIcon('catalog'),
} satisfies Record<keyof TabParamList, unknown>;

function Tabs() {
  const { bottom } = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTitleStyle: {
          ...typography.screenTitle,
          color: colors.textPrimary,
        },
        headerLeft: TabHeaderMark,
        tabBarStyle: [
          styles.tabBar,
          { height: 68 + bottom, paddingBottom: spacing.sm + bottom },
        ],
        tabBarItemStyle: styles.tabItem,
        tabBarLabel: TabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Início', tabBarIcon: tabIcons.Home }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
        options={{ title: 'Clientes', tabBarIcon: tabIcons.Customers }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{ title: 'Serviços', tabBarIcon: tabIcons.Jobs }}
      />
      <Tab.Screen
        name="CashFlow"
        component={CashFlowScreen}
        options={{ title: 'Caixa', tabBarIcon: tabIcons.CashFlow }}
      />
      <Tab.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{ title: 'Catálogo', tabBarIcon: tabIcons.Catalog }}
      />
    </Tab.Navigator>
  );
}

export function Navigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator>
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Group
          screenOptions={{
            headerTintColor: colors.textPrimary,
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTitleStyle: typography.section,
          }}
        >
          <Stack.Screen
            name="CustomerDetail"
            component={CustomerDetailScreen}
            options={{ title: 'Cliente' }}
          />
          <Stack.Screen
            name="CustomerForm"
            component={CustomerFormScreen}
            options={{ title: 'Cliente' }}
          />
          <Stack.Screen
            name="MeasurementForm"
            component={MeasurementFormScreen}
            options={{ title: 'Medida' }}
          />
          <Stack.Screen
            name="JobForm"
            component={JobFormScreen}
            options={{ title: 'Serviço' }}
          />
          <Stack.Screen
            name="ProductForm"
            component={ProductFormScreen}
            options={{ title: 'Produto' }}
          />
          <Stack.Screen
            name="ProductSaleForm"
            component={ProductSaleFormScreen}
            options={{ title: 'Venda de produto' }}
          />
          <Stack.Screen
            name="PaymentForm"
            component={PaymentFormScreen}
            options={{ title: 'Pagamento' }}
          />
          <Stack.Screen
            name="ExpenseForm"
            component={ExpenseFormScreen}
            options={{ title: 'Despesa' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Ajustes' }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function TabHeaderMark() {
  return (
    <View style={styles.mark}>
      <BrandMark />
    </View>
  );
}

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillFocused]}>
      <Icon
        name={name}
        color={focused ? colors.textPrimary : colors.textSecondary}
      />
    </View>
  );
}

function TabLabel({
  focused,
  children,
}: {
  focused: boolean;
  children: string;
}) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  mark: { marginLeft: spacing.gutter - 2, marginRight: spacing.xs },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  tabItem: { gap: 4 },
  iconPill: {
    width: 56,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillFocused: { backgroundColor: colors.surfaceMuted },
  tabLabel: { fontSize: 12, color: colors.textSecondary },
  tabLabelFocused: { color: colors.textPrimary, fontWeight: '700' },
});
