import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useDashboardOverview } from '@/src/features/dashboard/use-dashboard-overview';
import { listInquiries } from '@/src/features/inquiries/api';
import { listProducts } from '@/src/features/products/api';
import { loadRecentExportIds, loadRecentImportIds } from '@/src/features/transfers/storage';

jest.mock('@/src/features/products/api', () => ({
  listProducts: jest.fn(),
}));

jest.mock('@/src/features/inquiries/api', () => ({
  listInquiries: jest.fn(),
}));

jest.mock('@/src/features/transfers/storage', () => ({
  loadRecentExportIds: jest.fn(),
  loadRecentImportIds: jest.fn(),
}));

const mockedListProducts = jest.mocked(listProducts);
const mockedListInquiries = jest.mocked(listInquiries);
const mockedLoadRecentExportIds = jest.mocked(loadRecentExportIds);
const mockedLoadRecentImportIds = jest.mocked(loadRecentImportIds);

describe('useDashboardOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedListProducts.mockImplementation(async (_token, filters) => {
      if (filters.status === 'ready') {
        return {
          data: {
            products: [],
            pagination: { page: 1, page_size: 15, total_count: 8, total_pages: 1 },
            filters: {
              status: 'ready',
              query: null,
              product_tab_id: null,
              updated_from: null,
              updated_to: null,
              sort: 'updated_at',
              dir: 'desc',
            },
          },
        };
      }

      if (filters.status === 'processing') {
        return {
          data: {
            products: [],
            pagination: { page: 1, page_size: 15, total_count: 3, total_pages: 1 },
            filters: {
              status: 'processing',
              query: null,
              product_tab_id: null,
              updated_from: null,
              updated_to: null,
              sort: 'updated_at',
              dir: 'desc',
            },
          },
        };
      }

      return {
        data: {
          products: [
            {
              id: 11,
              status: 'ready',
              title: 'Nike Air Max 90',
              brand: 'Nike',
              category: 'Sneakers',
              price: '84.00',
              updated_at: '2026-04-02T00:00:00Z',
              product_tab: null,
            },
            {
              id: 12,
              status: 'processing',
              title: 'Levi Jacket',
              brand: 'Levi',
              category: 'Outerwear',
              price: '64.00',
              updated_at: '2026-04-01T23:00:00Z',
              product_tab: null,
            },
          ],
          pagination: { page: 1, page_size: 15, total_count: 14, total_pages: 1 },
          filters: {
            status: 'all',
            query: null,
            product_tab_id: null,
            updated_from: null,
            updated_to: null,
            sort: 'updated_at',
            dir: 'desc',
          },
        },
      };
    });

    mockedListInquiries.mockResolvedValue({
      data: {
        inquiries: [],
        pagination: { page: 1, page_size: 20, total_count: 5, total_pages: 1 },
      },
    });
    mockedLoadRecentExportIds.mockResolvedValue([11, 12]);
    mockedLoadRecentImportIds.mockResolvedValue([21]);
  });

  it('loads mobile dashboard stats and recent products', async () => {
    const { result } = renderHook(() => useDashboardOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.totalProducts).toBe(14);
    expect(result.current.readyProducts).toBe(8);
    expect(result.current.processingProducts).toBe(3);
    expect(result.current.inquiries).toBe(5);
    expect(result.current.trackedExports).toBe(2);
    expect(result.current.trackedImports).toBe(1);
    expect(result.current.recentProducts).toHaveLength(2);
  });

  it('refreshes dashboard data on demand', async () => {
    const { result } = renderHook(() => useDashboardOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(mockedListProducts).toHaveBeenCalledTimes(6);
    });
  });
});
