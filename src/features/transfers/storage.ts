import { getSecureItem, setSecureItem } from '@/src/lib/storage/secure-store';

const RECENT_EXPORT_IDS_KEY = 'transfers.recent_export_ids';
const RECENT_IMPORT_IDS_KEY = 'transfers.recent_import_ids';

export const MAX_RECENT_TRANSFER_IDS = 5;

export function prependRecentTransferId(ids: number[], nextId: number) {
  return [nextId, ...ids.filter((id) => id !== nextId)].slice(0, MAX_RECENT_TRANSFER_IDS);
}

export async function loadRecentExportIds() {
  return loadIdList(RECENT_EXPORT_IDS_KEY);
}

export async function loadRecentImportIds() {
  return loadIdList(RECENT_IMPORT_IDS_KEY);
}

export async function saveRecentExportIds(ids: number[]) {
  await setSecureItem(RECENT_EXPORT_IDS_KEY, JSON.stringify(ids));
}

export async function saveRecentImportIds(ids: number[]) {
  await setSecureItem(RECENT_IMPORT_IDS_KEY, JSON.stringify(ids));
}

async function loadIdList(key: string) {
  const rawValue = await getSecureItem(key);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  } catch {
    return [];
  }
}
