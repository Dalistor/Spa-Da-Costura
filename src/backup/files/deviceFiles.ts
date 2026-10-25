import { NativeModules } from 'react-native';

type BackupFileModule = {
  save(fileName: string, text: string): Promise<true | null>;
  open(): Promise<string | null>;
};

// Native module in android/.../BackupFileModule.kt. Only the screen loads this
// file, so tests never touch it.
function nativeModule(): BackupFileModule {
  return NativeModules.BackupFile as BackupFileModule;
}

/** Asks where to save the text; false when the seamstress closes the picker. */
export async function saveFile(
  fileName: string,
  text: string,
): Promise<boolean> {
  return (await nativeModule().save(fileName, text)) === true;
}

/** Asks which file to read; null when the seamstress closes the picker. */
export function openFile(): Promise<string | null> {
  return nativeModule().open();
}
