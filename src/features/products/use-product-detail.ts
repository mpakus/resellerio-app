import { useEffect, useRef, useState } from 'react';

import { formatApiError } from '@/src/lib/api/client';
import { getProduct } from '@/src/features/products/api';
import type { ProductDetail } from '@/src/features/products/types';

export function useProductDetail(token: string, productId: number) {
  const refreshRequestedRef = useRef(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);
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
        const response = await getProduct(token, productId);

        if (cancelled) {
          return;
        }

        setProduct(response.data.product);
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
  }, [productId, reloadKey, token]);

  function refresh() {
    refreshRequestedRef.current = true;
    setIsRefreshing(true);
    setReloadKey((current) => current + 1);
  }

  return {
    product,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
