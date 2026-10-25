import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { todayLocal } from '../../calendar';
import { colors, spacing, typography } from '../../theme';
import { Button } from '../../ui';
import type { ImportError } from '../domain';
import { openFile, saveFile } from '../files/deviceFiles';
import { useBackupService } from './BackupServiceContext';

const importErrorMessages: Record<ImportError, string> = {
  'invalid-file':
    'Arquivo inválido ou corrompido. Os dados atuais foram mantidos.',
  'newer-version': 'Este backup é de uma versão mais nova do app.',
};

export function SettingsScreen() {
  const backup = useBackupService();
  const [busy, setBusy] = useState(false);

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    try {
      await work();
    } catch {
      Alert.alert(
        'Backup',
        'Não foi possível acessar o arquivo. Tente de novo.',
      );
    } finally {
      setBusy(false);
    }
  };

  const generate = () =>
    run(async () => {
      const text = await backup.export();
      if (await saveFile(`spa-da-costura-${todayLocal()}.json`, text)) {
        Alert.alert('Backup salvo', 'Guarde o arquivo em um lugar seguro.');
      }
    });

  const replaceAll = (text: string) =>
    run(async () => {
      const result = await backup.import(text);
      if (result.ok) {
        Alert.alert(
          'Backup importado',
          'Os dados do arquivo foram restaurados.',
        );
      } else {
        Alert.alert('Backup recusado', importErrorMessages[result.error]);
      }
    });

  const restore = () =>
    run(async () => {
      const text = await openFile();
      if (text === null) {
        return;
      }
      Alert.alert(
        'Importar backup',
        'Todos os dados atuais serão substituídos pelos do arquivo. Deseja continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Importar',
            style: 'destructive',
            onPress: () => replaceAll(text),
          },
        ],
      );
    });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.title}>Gerar backup</Text>
        <Text style={styles.message}>
          Salva todos os dados do ateliê em um arquivo, que você pode guardar no
          aparelho, no Drive ou enviar para outro celular.
        </Text>
        <Button title="Gerar backup" onPress={generate} disabled={busy} />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Importar backup</Text>
        <Text style={styles.message}>
          Substitui todos os dados atuais pelos de um arquivo de backup.
        </Text>
        <Button
          title="Importar backup"
          variant="secondary"
          onPress={restore}
          disabled={busy}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: { ...typography.title, color: colors.textPrimary },
  message: { ...typography.body, color: colors.textSecondary },
});
