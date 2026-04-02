import { useEffect, useRef, useState } from 'react';

import { formatApiError } from '@/src/lib/api/client';
import { listInquiries } from '@/src/features/inquiries/api';
import { listProducts } from '@/src/features/products/api';
import { loadRecentExportIds, loadRecentImportIds } from '@/src/features/transfers/storage';
import type { DashboardOverview } from '@/src/features/dashboard/types';

const emptyOverview: DashboardOverview = {
  totalProducts: 0,
  readyProducts: 0,
  processingProducts: 0,
  inquiries: 0,
  trackedExports: 0,
  trackedImports: 0,
  recentProducts: [],
};

export function useDashboardOverview(token: string) {
  const refreshRequestedRef = useRef(false);
  const [overview, setOverview] = useState<DashboardOverview>(emptyOverview);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const isManualRefresh = refreshRequestedRef.current;

      setError(null);

      if (!isManualRefresh) {
        setIsLoading(true);
      }

      try {
        const [
          productsResponse,
          readyProductsResponse,
          processingProductsResponse,
          inquiriesResponse,
          recentExportIds,
          recentImportIds,
        ] = await Promise.all([
          listProducts(token, { status: 'all', query: '', productTabId: null, page: 1 }),
          listProducts(token, { status: 'ready', query: '', productTabId: null, page: 1 }),
          listProducts(token, { status: 'processing', query: '', productTabId: null, page: 1 }),
          listInquiries(token, { query: '', page: 1 }),
          loadRecentExportIds(),
          loadRecentImportIds(),
        ]);

        if (cancelled) {
          return;
        }

        setOverview({
          totalProducts: productsResponse.data.pagination.total_count,
          readyProducts: readyProductsResponse.data.pagination.total_count,
          processingProducts: processingProductsResponse.data.pagination.total_count,
          inquiries: inquiriesResponse.data.pagination.total_count,
          trackedExports: recentExportIds.length,
          trackedImports: recentImportIds.length,
          recentProducts: productsResponse.data.products.slice(0, 3),
        });
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
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, token]);

  function refresh() {
    refreshRequestedRef.current = true;
    setIsRefreshing(true);
    setReloadKey((current) => current + 1);
  }

  return {
    ...overview,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
