import type { ExportJob, ImportJob } from '@/src/features/transfers/types';

export function isExportJobActive(status: string) {
  return status === 'queued' || status === 'running';
}

export function isImportJobActive(status: string) {
  return status === 'queued' || status === 'running';
}

export function hasActiveTransfers(exports: ExportJob[], imports: ImportJob[]) {
  return exports.some((job) => isExportJobActive(job.status)) || imports.some((job) => isImportJobActive(job.status));
}

export function formatTransferStatus(status: string) {
  return status
    .split('_')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function describeExportJob(job: ExportJob) {
  const detailParts: string[] = [];

  if (typeof job.product_count === 'number' && job.product_count > 0) {
    detailParts.push(`${job.product_count} products`);
  }

  if (typeof job.filter_params.status === 'string' && job.filter_params.status.length > 0) {
    detailParts.push(`status ${job.filter_params.status}`);
  }

  if (typeof job.filter_params.query === 'string' && job.filter_params.query.length > 0) {
    detailParts.push(`query "${job.filter_params.query}"`);
  }

  return detailParts.join(' · ') || 'Full catalog export';
}

export function describeImportJob(job: ImportJob) {
  if (job.total_products > 0) {
    return `${job.imported_products}/${job.total_products} imported · ${job.failed_products} failed`;
  }

  if (job.failed_products > 0) {
    return `${job.failed_products} failed`;
  }

  return 'Waiting for import results';
}

export function getExportDisplayName(job: ExportJob) {
  return job.name?.trim() || job.file_name?.trim() || `Export #${job.id}`;
}

export function getImportDisplayName(job: ImportJob) {
  return job.source_filename?.trim() || `Import #${job.id}`;
}
