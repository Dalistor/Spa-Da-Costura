import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { todayLocal } from '../../calendar';
import { colors, radius, spacing, typography } from '../../theme';
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
          'Backup restaurado',
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
        'Restaurar backup',
        'Todos os dados atuais serão substituídos pelos do arquivo. Deseja continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Restaurar',
            style: 'destructive',
            onPress: () => replaceAll(text),
          },
        ],
      );
    });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.group}>
        Backup dos dados
      </Text>
      <View style={styles.section}>
        <Text style={styles.title}>Salvar backup</Text>
        <Text style={styles.message}>
          Salva todos os dados do ateliê em um arquivo, que você pode guardar no
          aparelho, no Drive ou enviar para outro celular.
        </Text>
        <Button title="Salvar backup" onPress={generate} disabled={busy} />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Restaurar backup</Text>
        <Text style={styles.message}>
          Traz de volta os dados de um arquivo de backup. Tudo o que está no app agora é substituído.
        </Text>
        <Button
          title="Restaurar backup"
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
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    gap: spacing.md - 4,
  },
  group: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.gutter,
    gap: spacing.sm,
  },
  title: { ...typography.section, color: colors.textPrimary },
  message: {
    ...typography.body,
    lineHeight: 23,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
