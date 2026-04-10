import { apiRequest } from '@/src/lib/api/client';
import type { PublicId } from '@/src/lib/api/types';
import type { ExportJobResponse, ImportJobResponse } from '@/src/features/transfers/types';

export function createExport(token: string, name?: string | null) {
  const trimmedName = name?.trim() ?? '';

  return apiRequest<ExportJobResponse>('/exports', {
    method: 'POST',
    token,
    body:
      trimmedName.length > 0
        ? {
            export: {
              name: trimmedName,
            },
          }
        : undefined,
  });
}

export function getExport(token: string, exportId: PublicId) {
  return apiRequest<ExportJobResponse>(`/exports/${exportId}`, { token });
}

export function createImport(token: string, filename: string, archiveBase64: string) {
  return apiRequest<ImportJobResponse>('/imports', {
    method: 'POST',
    token,
    body: {
      import: {
        filename,
        archive_base64: archiveBase64,
      },
    },
  });
}

export function getImport(token: string, importId: PublicId) {
  return apiRequest<ImportJobResponse>(`/imports/${importId}`, { token });
}
