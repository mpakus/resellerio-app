import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
  createProductTab,
  deleteProductTab,
  listProductTabs,
  listProducts,
  updateProductTab,
} from '@/src/features/products/api';
import { useProductsOverview } from '@/src/features/products/use-products-overview';

jest.mock('@/src/features/products/api', () => ({
  listProducts: jest.fn(),
  listProductTabs: jest.fn(),
  createProductTab: jest.fn(),
  updateProductTab: jest.fn(),
  deleteProductTab: jest.fn(),
}));

const mockedListProducts = jest.mocked(listProducts);
const mockedListProductTabs = jest.mocked(listProductTabs);
const mockedCreateProductTab = jest.mocked(createProductTab);
const mockedUpdateProductTab = jest.mocked(updateProductTab);
const mockedDeleteProductTab = jest.mocked(deleteProductTab);

describe('useProductsOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedListProductTabs.mockResolvedValue({
      data: {
        product_tabs: [
          {
            id: 7,
            name: 'Shoes',
            position: 1,
            inserted_at: '2026-04-01T00:00:00Z',
            updated_at: '2026-04-01T00:00:00Z',
          },
        ],
      },
    });

    mockedListProducts.mockResolvedValue({
      data: {
        products: [
          {
            id: 11,
            status: 'ready',
            title: 'Nike Air Max 90',
            brand: 'Nike',
            category: 'Sneakers',
            price: '84.00',
            updated_at: '2026-04-01T00:00:00Z',
            product_tab: {
              id: 7,
              name: 'Shoes',
              position: 1,
            },
          },
        ],
        pagination: {
          page: 1,
          page_size: 15,
          total_count: 1,
          total_pages: 1,
        },
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
    });
  });

  it('loads products and tabs on mount', async () => {
    const { result } = renderHook(() => useProductsOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.productTabs).toHaveLength(1);
    expect(result.current.products).toHaveLength(1);
    expect(mockedListProductTabs).toHaveBeenCalledWith('token-123');
    expect(mockedListProducts).toHaveBeenCalledWith(
      'token-123',
      expect.objectContaining({ status: 'all', page: 1 }),
    );
  });

  it('applies search text when submitSearch is called', async () => {
    const { result } = renderHook(() => useProductsOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSearchDraft('air max');
    });

    act(() => {
      result.current.submitSearch();
    });

    await waitFor(() => {
      expect(mockedListProducts).toHaveBeenLastCalledWith(
        'token-123',
        expect.objectContaining({ query: 'air max', page: 1 }),
      );
    });
  });

  it('creates a tab and selects it for filtering', async () => {
    mockedListProductTabs
      .mockResolvedValueOnce({
        data: {
          product_tabs: [
            {
              id: 7,
              name: 'Shoes',
              position: 1,
              inserted_at: '2026-04-01T00:00:00Z',
              updated_at: '2026-04-01T00:00:00Z',
            },
          ],
        },
      })
      .mockResolvedValue({
        data: {
          product_tabs: [
            {
              id: 7,
              name: 'Shoes',
              position: 1,
              inserted_at: '2026-04-01T00:00:00Z',
              updated_at: '2026-04-01T00:00:00Z',
            },
            {
              id: 9,
              name: 'Outerwear',
              position: 2,
              inserted_at: '2026-04-01T00:00:00Z',
              updated_at: '2026-04-01T00:00:00Z',
            },
          ],
        },
      });

    mockedCreateProductTab.mockResolvedValue({
      data: {
        product_tab: {
          id: 9,
          name: 'Outerwear',
          position: 2,
          inserted_at: '2026-04-01T00:00:00Z',
          updated_at: '2026-04-01T00:00:00Z',
        },
      },
    });

    const { result } = renderHook(() => useProductsOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.setTabName('Outerwear');
    });

    await act(async () => {
      await result.current.addProductTab();
    });

    expect(mockedCreateProductTab).toHaveBeenCalledWith('token-123', 'Outerwear');
    await waitFor(() => {
      expect(result.current.productTabs.map((tab) => tab.name)).toEqual(['Shoes', 'Outerwear']);
      expect(result.current.filters.productTabId).toBe(9);
      expect(result.current.tabName).toBe('');
    });
  });

  it('renames a tab in place', async () => {
    mockedUpdateProductTab.mockResolvedValue({
      data: {
        product_tab: {
          id: 7,
          name: 'Sneakers',
          position: 1,
          inserted_at: '2026-04-01T00:00:00Z',
          updated_at: '2026-04-01T00:00:00Z',
        },
      },
    });

    const { result } = renderHook(() => useProductsOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEditingTab(result.current.productTabs[0]);
      result.current.setEditingTabName('Sneakers');
    });

    await act(async () => {
      await result.current.saveEditingTab();
    });

    expect(mockedUpdateProductTab).toHaveBeenCalledWith('token-123', 7, 'Sneakers');
    expect(result.current.productTabs[0]?.name).toBe('Sneakers');
    expect(result.current.editingTabId).toBeNull();
  });

  it('deletes a selected tab and clears the active tab filter', async () => {
    mockedListProductTabs
      .mockResolvedValueOnce({
        data: {
          product_tabs: [
            {
              id: 7,
              name: 'Shoes',
              position: 1,
              inserted_at: '2026-04-01T00:00:00Z',
              updated_at: '2026-04-01T00:00:00Z',
            },
          ],
        },
      })
      .mockResolvedValue({
        data: {
          product_tabs: [],
        },
      });

    mockedDeleteProductTab.mockResolvedValue({
      data: { deleted: true },
    });

    const { result } = renderHook(() => useProductsOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.selectProductTab(7);
    });

    await act(async () => {
      await result.current.removeProductTab(7);
    });

    expect(mockedDeleteProductTab).toHaveBeenCalledWith('token-123', 7);
    await waitFor(() => {
      expect(result.current.productTabs).toEqual([]);
      expect(result.current.filters.productTabId).toBeNull();
    });
  });
});
