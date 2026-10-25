import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CashFlowScreen, PaymentFormScreen } from '../../finance';
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
import { colors } from '../../theme';
import { PendingScreen } from './PendingScreen';
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

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: () => null,
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: { fontSize: 14 },
      }}
    >
      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
        options={{ title: 'Clientes' }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{ title: 'Serviços' }}
      />
      <Tab.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{ title: 'Catálogo' }}
      />
      <Tab.Screen
        name="CashFlow"
        component={CashFlowScreen}
        options={{ title: 'Caixa' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Ajustes' }}
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
        <Stack.Group screenOptions={{ headerTintColor: colors.accent }}>
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
            component={PendingScreen}
            options={{ title: 'Despesa' }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
