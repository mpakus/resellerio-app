import { useEffect, useRef, useState } from 'react';

import { formatApiError } from '@/src/lib/api/client';
import { createProductTab, listProductTabs, listProducts } from '@/src/features/products/api';
import type {
  ProductSummary,
  ProductTab,
  ProductStatusFilter,
  ProductsFilters,
  ProductsPagination,
} from '@/src/features/products/types';

const defaultPagination: ProductsPagination = {
  page: 1,
  page_size: 15,
  total_count: 0,
  total_pages: 1,
};

export function useProductsOverview(token: string) {
  const refreshRequestedRef = useRef(false);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [productTabs, setProductTabs] = useState<ProductTab[]>([]);
  const [filters, setFilters] = useState<ProductsFilters>({
    status: 'all',
    query: '',
    productTabId: null,
    page: 1,
  });
  const [searchDraft, setSearchDraft] = useState('');
  const [pagination, setPagination] = useState<ProductsPagination>(defaultPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tabName, setTabName] = useState('');
  const [tabError, setTabError] = useState<string | null>(null);
  const [isCreatingTab, setIsCreatingTab] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const isManualRefresh = refreshRequestedRef.current;

      setError(null);

      if (!isManualRefresh) {
        setIsLoading(true);
      }

      try {
        const [tabsResponse, productsResponse] = await Promise.all([
          listProductTabs(token),
          listProducts(token, filters),
        ]);

        if (cancelled) {
          return;
        }

        setProductTabs(tabsResponse.data.product_tabs);
        setProducts(productsResponse.data.products);
        setPagination(productsResponse.data.pagination);
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
  }, [filters, reloadKey, token]);

  function setStatus(status: ProductStatusFilter) {
    setFilters((current) => ({ ...current, status, page: 1 }));
  }

  function selectProductTab(tabId: number | null) {
    setFilters((current) => ({ ...current, productTabId: tabId, page: 1 }));
  }

  function submitSearch() {
    setFilters((current) => ({
      ...current,
      query: searchDraft.trim(),
      page: 1,
    }));
  }

  function clearSearch() {
    setSearchDraft('');
    setFilters((current) => ({ ...current, query: '', page: 1 }));
  }

  function refresh() {
    refreshRequestedRef.current = true;
    setIsRefreshing(true);
    setReloadKey((current) => current + 1);
  }

  function loadNextPage() {
    if (pagination.page >= pagination.total_pages || isLoading) {
      return;
    }

    setFilters((current) => ({ ...current, page: current.page + 1 }));
  }

  async function addProductTab() {
    const trimmed = tabName.trim();

    if (!trimmed) {
      setTabError('Enter a tab name first.');
      return;
    }

    setIsCreatingTab(true);
    setTabError(null);

    try {
      const response = await createProductTab(token, trimmed);
      const newTab = response.data.product_tab;

      setProductTabs((current) =>
        [...current, newTab].sort((left, right) => left.position - right.position),
      );
      setTabName('');
      setFilters((current) => ({
        ...current,
        productTabId: newTab.id,
        page: 1,
      }));
    } catch (createError) {
      setTabError(formatApiError(createError));
    } finally {
      setIsCreatingTab(false);
    }
  }

  return {
    products,
    productTabs,
    filters,
    searchDraft,
    setSearchDraft,
    pagination,
    isLoading,
    isRefreshing,
    error,
    refresh,
    setStatus,
    selectProductTab,
    submitSearch,
    clearSearch,
    loadNextPage,
    tabName,
    setTabName,
    tabError,
    isCreatingTab,
    addProductTab,
  };
}
