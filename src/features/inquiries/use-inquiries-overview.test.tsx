import { act, renderHook, waitFor } from '@testing-library/react-native';

import { deleteInquiry, listInquiries } from '@/src/features/inquiries/api';
import { useInquiriesOverview } from '@/src/features/inquiries/use-inquiries-overview';

jest.mock('@/src/features/inquiries/api', () => ({
  listInquiries: jest.fn(),
  deleteInquiry: jest.fn(),
}));

const mockedListInquiries = jest.mocked(listInquiries);
const mockedDeleteInquiry = jest.mocked(deleteInquiry);

describe('useInquiriesOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedListInquiries.mockResolvedValue({
      data: {
        inquiries: [
          {
            id: 7,
            full_name: 'Jane Buyer',
            contact: 'jane@example.com',
            message: 'Is this still available?',
            source_path: '/store/my-store/products/1-vintage-jacket',
            product_id: 12,
            inserted_at: '2026-04-02T10:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          page_size: 20,
          total_count: 1,
          total_pages: 1,
        },
      },
    });
  });

  it('loads inquiries on mount', async () => {
    const { result } = renderHook(() => useInquiriesOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedListInquiries).toHaveBeenCalledWith('token-123', {
      query: '',
      page: 1,
    });
    expect(result.current.inquiries).toHaveLength(1);
  });

  it('submits search and resets to the first page', async () => {
    const { result } = renderHook(() => useInquiriesOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSearchDraft('jane');
    });

    await waitFor(() => {
      expect(result.current.searchDraft).toBe('jane');
    });

    act(() => {
      result.current.submitSearch();
    });

    await waitFor(() => {
      expect(mockedListInquiries).toHaveBeenLastCalledWith('token-123', {
        query: 'jane',
        page: 1,
      });
    });
  });

  it('loads the next page and appends unique inquiries', async () => {
    mockedListInquiries
      .mockResolvedValueOnce({
        data: {
          inquiries: [
            {
              id: 7,
              full_name: 'Jane Buyer',
              contact: 'jane@example.com',
              message: 'Is this still available?',
              source_path: '/store/my-store/products/1-vintage-jacket',
              product_id: 12,
              inserted_at: '2026-04-02T10:00:00Z',
            },
          ],
          pagination: {
            page: 1,
            page_size: 20,
            total_count: 2,
            total_pages: 2,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          inquiries: [
            {
              id: 8,
              full_name: 'Alex Customer',
              contact: 'alex@example.com',
              message: 'Can you ship this week?',
              source_path: '/store/my-store/products/2-bag',
              product_id: 15,
              inserted_at: '2026-04-02T11:00:00Z',
            },
          ],
          pagination: {
            page: 2,
            page_size: 20,
            total_count: 2,
            total_pages: 2,
          },
        },
      });

    const { result } = renderHook(() => useInquiriesOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.loadNextPage();
    });

    await waitFor(() => {
      expect(result.current.inquiries).toHaveLength(2);
    });
  });

  it('deletes an inquiry and removes it from local state', async () => {
    mockedDeleteInquiry.mockResolvedValue({
      data: {
        deleted: true,
      },
    });

    const { result } = renderHook(() => useInquiriesOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.removeInquiry(7);
    });

    expect(mockedDeleteInquiry).toHaveBeenCalledWith('token-123', 7);
    expect(result.current.inquiries).toEqual([]);
  });
});
