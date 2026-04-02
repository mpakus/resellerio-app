import { useEffect, useRef, useState } from 'react';

import { formatApiError } from '@/src/lib/api/client';
import { getProduct, updateProduct } from '@/src/features/products/api';
import { shouldPollProductDetail } from '@/src/features/products/helpers';
import type { ProductDetail } from '@/src/features/products/types';

const PRODUCT_DETAIL_POLL_INTERVAL_MS = 5000;

export function useProductDetail(token: string, productId: number) {
  const refreshRequestedRef = useRef(false);
  const pollRequestedRef = useRef(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
        pollRequestedRef.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [productId, reloadKey, token]);

  useEffect(() => {
    if (!shouldPollProductDetail(product) || error) {
      return;
    }

    const timeoutId = setTimeout(() => {
      pollRequestedRef.current = true;
      setReloadKey((current) => current + 1);
    }, PRODUCT_DETAIL_POLL_INTERVAL_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [error, product]);

  function refresh() {
    refreshRequestedRef.current = true;
    setIsRefreshing(true);
    setReloadKey((current) => current + 1);
  }

  async function saveProduct(body: { product: Record<string, unknown> }) {
    setIsSaving(true);

    try {
      const response = await updateProduct(token, productId, body);
      setProduct(response.data.product);
      return response.data.product;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    product,
    isLoading,
    isRefreshing,
    isSaving,
    isPolling: shouldPollProductDetail(product),
    error,
    refresh,
    saveProduct,
  };
}
