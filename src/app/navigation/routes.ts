import type { NavigatorScreenParams } from '@react-navigation/native';

/** Bottom tabs; labels shown to the user are in Portuguese (see Navigator). */
export type TabParamList = {
  Home: undefined;
  Customers: undefined;
  Jobs: undefined;
  CashFlow: undefined;
  Catalog: undefined;
};

/** Routes carry only ids; screens load the data from their repositories. */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  CustomerDetail: { customerId: number };
  CustomerJobs: { customerId: number };
  CustomerSales: { customerId: number };
  CustomerPayments: { customerId: number };
  CustomerForm: { customerId?: number } | undefined;
  MeasurementForm: { customerId: number; measurementId?: number };
  JobForm: { customerId?: number; jobId?: number } | undefined;
  ProductForm: { productId?: number } | undefined;
  ProductSaleForm: { customerId: number; saleId?: number };
  PaymentForm: { customerId: number; paymentId?: number };
  ExpenseForm: { expenseId?: number } | undefined;
  MonthExpenses: { month: string };
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
