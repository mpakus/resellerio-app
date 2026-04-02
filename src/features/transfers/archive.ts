import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import type { PickedImportArchive } from '@/src/features/transfers/types';

const ZIP_MIME_TYPES = ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'];

export async function pickImportArchive(): Promise<PickedImportArchive | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ZIP_MIME_TYPES,
    copyToCacheDirectory: true,
    multiple: false,
    base64: Platform.OS === 'web',
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  const archiveBase64 = asset.base64 ?? (await new File(asset.uri).base64());

  return {
    filename: asset.name,
    archiveBase64,
  };
}
