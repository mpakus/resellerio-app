import { useEffect, useState } from 'react';

import { formatApiError } from '@/src/lib/api/client';
import { listProductTabs } from '@/src/features/products/api';
import type { ProductTab } from '@/src/features/products/types';

export function useProductTabs(token: string) {
  const [productTabs, setProductTabs] = useState<ProductTab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      setIsLoading(true);

      try {
        const response = await listProductTabs(token);

        if (cancelled) {
          return;
        }

        setProductTabs(response.data.product_tabs);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(formatApiError(loadError));
      } finally {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, token]);

  function refresh() {
    setReloadKey((current) => current + 1);
  }

  return {
    productTabs,
    isLoading,
    error,
    refresh,
  };
}
