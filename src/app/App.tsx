import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Database } from '../database';
import { colors } from '../theme';
import { EmptyState } from '../ui';
import { DatabaseProvider } from './DatabaseContext';
import { Navigator } from './navigation/Navigator';
import { RepositoriesProvider } from './RepositoriesProvider';
import { useDatabaseStartup } from './useDatabaseStartup';

type Props = {
  openDatabase: () => Database;
};

export function App({ openDatabase }: Props) {
  const startup = useDatabaseStartup(openDatabase);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {startup.status === 'starting' && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      )}
      {startup.status === 'failed' && (
        <EmptyState
          title="Não foi possível abrir os dados do ateliê"
          message="Feche e abra o app novamente. Se o problema continuar, restaure um backup."
        />
      )}
      {startup.status === 'ready' && (
        <DatabaseProvider database={startup.database}>
          <RepositoriesProvider>
            <Navigator />
          </RepositoriesProvider>
        </DatabaseProvider>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
