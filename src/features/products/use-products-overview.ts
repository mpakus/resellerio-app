import { useEffect, useRef, useState } from 'react';

import { formatApiError } from '@/src/lib/api/client';
import type { PublicId } from '@/src/lib/api/types';
import {
  createProductTab,
  deleteProductTab,
  listProductTabs,
  listProducts,
  updateProductTab,
} from '@/src/features/products/api';
import { isIsoDateInput } from '@/src/features/products/helpers';
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
  const defaultFilters: ProductsFilters = {
    status: 'all',
    query: '',
    productTabId: null,
    updatedFrom: '',
    updatedTo: '',
    sort: 'updated_at',
    dir: 'desc',
    page: 1,
  };
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [productTabs, setProductTabs] = useState<ProductTab[]>([]);
  const [filters, setFilters] = useState<ProductsFilters>(defaultFilters);
  const [filtersDraft, setFiltersDraft] = useState({
    sort: defaultFilters.sort,
    dir: defaultFilters.dir,
    updatedFrom: defaultFilters.updatedFrom,
    updatedTo: defaultFilters.updatedTo,
  });
  const [searchDraft, setSearchDraft] = useState('');
  const [pagination, setPagination] = useState<ProductsPagination>(defaultPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tabName, setTabName] = useState('');
  const [tabError, setTabError] = useState<string | null>(null);
  const [filtersError, setFiltersError] = useState<string | null>(null);
  const [isCreatingTab, setIsCreatingTab] = useState(false);
  const [editingTabId, setEditingTabId] = useState<PublicId | null>(null);
  const [editingTabName, setEditingTabName] = useState('');
  const [isUpdatingTab, setIsUpdatingTab] = useState(false);
  const [deletingTabId, setDeletingTabId] = useState<PublicId | null>(null);

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

  function selectProductTab(tabId: PublicId | null) {
    setFilters((current) => ({ ...current, productTabId: tabId, page: 1 }));
  }

  function submitSearch() {
    const trimmedQuery = searchDraft.trim();

    setSearchDraft(trimmedQuery);
    setFilters((current) => ({
      ...current,
      query: trimmedQuery,
      page: 1,
    }));
  }

  function clearSearch() {
    setSearchDraft('');
    setFilters((current) => ({ ...current, query: '', page: 1 }));
  }

  function updateFiltersDraft<Key extends keyof typeof filtersDraft>(
    key: Key,
    value: (typeof filtersDraft)[Key],
  ) {
    setFiltersDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetFiltersDraft() {
    setFiltersDraft({
      sort: filters.sort,
      dir: filters.dir,
      updatedFrom: filters.updatedFrom,
      updatedTo: filters.updatedTo,
    });
    setFiltersError(null);
  }

  function applyFilters() {
    const nextUpdatedFrom = filtersDraft.updatedFrom.trim();
    const nextUpdatedTo = filtersDraft.updatedTo.trim();

    if (!isIsoDateInput(nextUpdatedFrom) || !isIsoDateInput(nextUpdatedTo)) {
      setFiltersError('Use YYYY-MM-DD for updated date filters.');
      return false;
    }

    setFiltersError(null);
    setFilters((current) => ({
      ...current,
      sort: filtersDraft.sort,
      dir: filtersDraft.dir,
      updatedFrom: nextUpdatedFrom,
      updatedTo: nextUpdatedTo,
      page: 1,
    }));
    return true;
  }

  function clearAdvancedFilters() {
    setFiltersDraft({
      sort: defaultFilters.sort,
      dir: defaultFilters.dir,
      updatedFrom: '',
      updatedTo: '',
    });
    setFiltersError(null);
    setFilters((current) => ({
      ...current,
      sort: defaultFilters.sort,
      dir: defaultFilters.dir,
      updatedFrom: '',
      updatedTo: '',
      page: 1,
    }));
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
      return false;
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
      return true;
    } catch (createError) {
      setTabError(formatApiError(createError));
      return false;
    } finally {
      setIsCreatingTab(false);
    }
  }

  function startEditingTab(tab: ProductTab) {
    setTabError(null);
    setEditingTabId(tab.id);
    setEditingTabName(tab.name);
  }

  function cancelEditingTab() {
    setEditingTabId(null);
    setEditingTabName('');
    setTabError(null);
  }

  async function saveEditingTab() {
    const trimmed = editingTabName.trim();

    if (editingTabId === null) {
      return false;
    }

    if (!trimmed) {
      setTabError('Enter a tab name first.');
      return false;
    }

    setIsUpdatingTab(true);
    setTabError(null);

    try {
      const response = await updateProductTab(token, editingTabId, trimmed);
      const updatedTab = response.data.product_tab;

      setProductTabs((current) =>
        current
          .map((tab) => (tab.id === updatedTab.id ? updatedTab : tab))
          .sort((left, right) => left.position - right.position),
      );
      setEditingTabId(null);
      setEditingTabName('');
      return true;
    } catch (updateError) {
      setTabError(formatApiError(updateError));
      return false;
    } finally {
      setIsUpdatingTab(false);
    }
  }

  async function removeProductTab(tabId: PublicId) {
    setDeletingTabId(tabId);
    setTabError(null);

    try {
      await deleteProductTab(token, tabId);

      setProductTabs((current) => current.filter((tab) => tab.id !== tabId));
      setFilters((current) => ({
        ...current,
        productTabId: current.productTabId === tabId ? null : current.productTabId,
        page: 1,
      }));

      if (editingTabId === tabId) {
        setEditingTabId(null);
        setEditingTabName('');
      }
    } catch (deleteError) {
      setTabError(formatApiError(deleteError));
    } finally {
      setDeletingTabId(null);
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
    filtersDraft,
    filtersError,
    updateFiltersDraft,
    resetFiltersDraft,
    applyFilters,
    clearAdvancedFilters,
    isCreatingTab,
    addProductTab,
    editingTabId,
    editingTabName,
    setEditingTabName,
    startEditingTab,
    cancelEditingTab,
    isUpdatingTab,
    saveEditingTab,
    deletingTabId,
    removeProductTab,
    hasActiveAdvancedFilters:
      filters.sort !== defaultFilters.sort ||
      filters.dir !== defaultFilters.dir ||
      filters.updatedFrom.trim().length > 0 ||
      filters.updatedTo.trim().length > 0,
  };
}
