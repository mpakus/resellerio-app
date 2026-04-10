import { useEffect, useRef, useState } from 'react';

import { formatApiError } from '@/src/lib/api/client';
import type { PublicId } from '@/src/lib/api/types';
import { deleteInquiry, listInquiries } from '@/src/features/inquiries/api';
import type {
  InquiriesFilters,
  InquiriesPagination,
  Inquiry,
} from '@/src/features/inquiries/types';

const defaultPagination: InquiriesPagination = {
  page: 1,
  page_size: 20,
  total_count: 0,
  total_pages: 1,
};

export function useInquiriesOverview(token: string) {
  const refreshRequestedRef = useRef(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filters, setFilters] = useState<InquiriesFilters>({
    query: '',
    page: 1,
  });
  const [searchDraft, setSearchDraft] = useState('');
  const [pagination, setPagination] = useState<InquiriesPagination>(defaultPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingInquiryId, setDeletingInquiryId] = useState<PublicId | null>(null);
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
        const response = await listInquiries(token, filters);

        if (cancelled) {
          return;
        }

        const nextInquiries = response.data.inquiries;

        setInquiries((current) => {
          if (filters.page === 1) {
            return nextInquiries;
          }

          const existingIds = new Set(current.map((inquiry) => inquiry.id));
          const appended = nextInquiries.filter((inquiry) => !existingIds.has(inquiry.id));
          return [...current, ...appended];
        });
        setPagination(response.data.pagination);
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

  function submitSearch() {
    setFilters((current) => ({
      ...current,
      query: searchDraft.trim(),
      page: 1,
    }));
  }

  function clearSearch() {
    setSearchDraft('');
    setFilters({
      query: '',
      page: 1,
    });
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

  async function removeInquiry(inquiryId: PublicId) {
    setDeletingInquiryId(inquiryId);
    setError(null);

    try {
      await deleteInquiry(token, inquiryId);

      setInquiries((current) => current.filter((inquiry) => inquiry.id !== inquiryId));
      setPagination((current) => ({
        ...current,
        total_count: Math.max(0, current.total_count - 1),
      }));
      return true;
    } catch (deleteError) {
      setError(formatApiError(deleteError));
      return false;
    } finally {
      setDeletingInquiryId(null);
    }
  }

  return {
    inquiries,
    filters,
    searchDraft,
    setSearchDraft,
    pagination,
    isLoading,
    isRefreshing,
    deletingInquiryId,
    error,
    refresh,
    submitSearch,
    clearSearch,
    loadNextPage,
    removeInquiry,
  };
}
