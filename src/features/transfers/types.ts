import type { PublicId } from '@/src/lib/api/types';

export type ExportJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'stalled' | string;

export type ImportJobStatus = 'queued' | 'running' | 'completed' | 'failed' | string;

export type ExportJob = {
  id: PublicId;
  name: string | null;
  file_name: string | null;
  filter_params: Record<string, unknown>;
  product_count: number | null;
  status: ExportJobStatus;
  storage_key: string | null;
  download_url: string | null;
  requested_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  error_message: string | null;
  inserted_at: string | null;
  updated_at: string | null;
};

export type ImportFailureItem = {
  row?: number | null;
  sku?: string | null;
  title?: string | null;
  errors?: string[];
};

export type ImportFailureDetails = {
  items?: ImportFailureItem[];
  [key: string]: unknown;
};

export type ImportJob = {
  id: PublicId;
  status: ImportJobStatus;
  source_filename: string | null;
  source_storage_key: string | null;
  requested_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  total_products: number;
  imported_products: number;
  failed_products: number;
  error_message: string | null;
  failure_details: ImportFailureDetails;
  payload: Record<string, unknown>;
  inserted_at: string | null;
  updated_at: string | null;
};

export type ExportJobResponse = {
  data: {
    export: ExportJob;
  };
};

export type ImportJobResponse = {
  data: {
    import: ImportJob;
  };
};

export type PickedImportArchive = {
  filename: string;
  archiveBase64: string;
};
