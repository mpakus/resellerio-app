import { useEffect, useRef, useState } from 'react';

import { formatApiError } from '@/src/lib/api/client';
import { pickImportArchive } from '@/src/features/transfers/archive';
import { createExport, createImport, getExport, getImport } from '@/src/features/transfers/api';
import { hasActiveTransfers } from '@/src/features/transfers/helpers';
import {
  loadRecentExportIds,
  loadRecentImportIds,
  prependRecentTransferId,
  saveRecentExportIds,
  saveRecentImportIds,
} from '@/src/features/transfers/storage';
import type { ExportJob, ImportJob } from '@/src/features/transfers/types';

const TRANSFER_POLL_INTERVAL_MS = 5000;

export function useTransfersOverview(token: string) {
  const refreshRequestedRef = useRef(false);
  const pollRequestedRef = useRef(false);
  const recentExportIdsRef = useRef<number[]>([]);
  const recentImportIdsRef = useRef<number[]>([]);
  const [recentExports, setRecentExports] = useState<ExportJob[]>([]);
  const [recentImports, setRecentImports] = useState<ImportJob[]>([]);
  const [exportNameDraft, setExportNameDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingExport, setIsCreatingExport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const isManualRefresh = refreshRequestedRef.current;
      const isPollRefresh = pollRequestedRef.current;

      setError(null);

      if (!isManualRefresh && !isPollRefresh) {
        setIsLoading(true);
      }

      try {
        const [storedExportIds, storedImportIds] = await Promise.all([
          loadRecentExportIds(),
          loadRecentImportIds(),
        ]);

        const [exportsResult, importsResult] = await Promise.all([
          loadExportJobs(token, storedExportIds),
          loadImportJobs(token, storedImportIds),
        ]);

        if (cancelled) {
          return;
        }

        setRecentExports(exportsResult.jobs);
        setRecentImports(importsResult.jobs);
        recentExportIdsRef.current = exportsResult.ids;
        recentImportIdsRef.current = importsResult.ids;

        if (exportsResult.ids.join('|') !== storedExportIds.join('|')) {
          void saveRecentExportIds(exportsResult.ids);
        }

        if (importsResult.ids.join('|') !== storedImportIds.join('|')) {
          void saveRecentImportIds(importsResult.ids);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(formatApiError(loadError));
      } finally {
        if (cancelled) {
          return;
        }

        refreshRequestedRef.current = false;
        pollRequestedRef.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, token]);

  useEffect(() => {
    if (!hasActiveTransfers(recentExports, recentImports) || error) {
      return;
    }

    const timeoutId = setTimeout(() => {
      pollRequestedRef.current = true;
      setReloadKey((current) => current + 1);
    }, TRANSFER_POLL_INTERVAL_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [error, recentExports, recentImports]);

  function refresh() {
    refreshRequestedRef.current = true;
    setIsRefreshing(true);
    setReloadKey((current) => current + 1);
  }

  async function startExport() {
    setIsCreatingExport(true);
    setExportError(null);

    try {
      const response = await createExport(token, exportNameDraft);
      const nextJob = response.data.export;
      const nextIds = prependRecentTransferId(recentExportIdsRef.current, nextJob.id);

      setExportNameDraft('');
      recentExportIdsRef.current = nextIds;
      setRecentExports((current) => [nextJob, ...current.filter((job) => job.id !== nextJob.id)].slice(0, 5));

      await saveRecentExportIds(nextIds);
      return nextJob;
    } catch (createError) {
      setExportError(formatApiError(createError));
      return null;
    } finally {
      setIsCreatingExport(false);
    }
  }

  async function startImport() {
    setIsImporting(true);
    setImportError(null);

    try {
      const pickedArchive = await pickImportArchive();

      if (!pickedArchive) {
        return null;
      }

      const response = await createImport(
        token,
        pickedArchive.filename,
        pickedArchive.archiveBase64,
      );
      const nextJob = response.data.import;
      const nextIds = prependRecentTransferId(recentImportIdsRef.current, nextJob.id);

      recentImportIdsRef.current = nextIds;
      setRecentImports((current) => [nextJob, ...current.filter((job) => job.id !== nextJob.id)].slice(0, 5));

      await saveRecentImportIds(nextIds);
      return nextJob;
    } catch (createError) {
      setImportError(formatApiError(createError));
      return null;
    } finally {
      setIsImporting(false);
    }
  }

  return {
    recentExports,
    recentImports,
    exportNameDraft,
    isLoading,
    isRefreshing,
    isCreatingExport,
    isImporting,
    isPolling: hasActiveTransfers(recentExports, recentImports),
    error,
    exportError,
    importError,
    refresh,
    setExportNameDraft,
    startExport,
    startImport,
  };
}

async function loadExportJobs(token: string, ids: number[]) {
  const settled = await Promise.allSettled(ids.map((id) => getExport(token, id)));
  const jobs: ExportJob[] = [];
  const validIds: number[] = [];

  settled.forEach((result, index) => {
    if (result.status !== 'fulfilled') {
      return;
    }

    jobs.push(result.value.data.export);
    validIds.push(ids[index]);
  });

  return {
    ids: validIds,
    jobs,
  };
}

async function loadImportJobs(token: string, ids: number[]) {
  const settled = await Promise.allSettled(ids.map((id) => getImport(token, id)));
  const jobs: ImportJob[] = [];
  const validIds: number[] = [];

  settled.forEach((result, index) => {
    if (result.status !== 'fulfilled') {
      return;
    }

    jobs.push(result.value.data.import);
    validIds.push(ids[index]);
  });

  return {
    ids: validIds,
    jobs,
  };
}
