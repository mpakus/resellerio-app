import { act, renderHook, waitFor } from '@testing-library/react-native';

import { getProduct } from '@/src/features/products/api';
import { useProductDetail } from '@/src/features/products/use-product-detail';

jest.mock('@/src/features/products/api', () => ({
  getProduct: jest.fn(),
  listProducts: jest.fn(),
  listProductTabs: jest.fn(),
  createProductTab: jest.fn(),
  updateProductTab: jest.fn(),
  deleteProductTab: jest.fn(),
}));

const mockedGetProduct = jest.mocked(getProduct);

describe('useProductDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetProduct.mockResolvedValue({
      data: {
        product: {
          id: 11,
          status: 'review',
          source: 'manual',
          title: 'Nike Air Max 90',
          brand: 'Nike',
          category: 'Sneakers',
          condition: 'Good',
          color: 'White',
          size: '10',
          material: 'Leather',
          price: '84.00',
          cost: '30.00',
          product_tab_id: 7,
          product_tab: {
            id: 7,
            name: 'Shoes',
            position: 1,
          },
          sku: 'NK-90',
          tags: ['air-max', 'vintage'],
          notes: 'Minor wear on heel',
          ai_summary: 'Vintage Nike sneakers with visible wear and good resale value.',
          ai_confidence: 0.92,
          sold_at: null,
          archived_at: null,
          inserted_at: '2026-04-01T00:00:00Z',
          updated_at: '2026-04-01T00:00:00Z',
          latest_processing_run: {
            id: 41,
            status: 'completed',
            step: 'variants_generated',
            started_at: '2026-04-01T00:00:00Z',
            finished_at: '2026-04-01T00:01:00Z',
            error_code: null,
            error_message: null,
            inserted_at: '2026-04-01T00:00:00Z',
            updated_at: '2026-04-01T00:01:00Z',
            payload: {},
          },
          latest_lifestyle_generation_run: null,
          description_draft: {
            id: 3,
            status: 'completed',
            provider: 'gemini',
            model: 'model-1',
            suggested_title: 'Nike Air Max 90 Vintage Sneakers',
            short_description: 'Classic Nike sneakers ready for resale.',
            long_description: 'A longer description',
            key_features: ['Leather upper'],
            seo_keywords: ['Nike', 'Air Max 90'],
            missing_details_warning: null,
            inserted_at: '2026-04-01T00:00:00Z',
            updated_at: '2026-04-01T00:00:00Z',
          },
          price_research: {
            id: 8,
            status: 'completed',
            provider: 'gemini',
            model: 'model-1',
            currency: 'USD',
            suggested_min_price: '60.00',
            suggested_target_price: '84.00',
            suggested_max_price: '99.00',
            suggested_median_price: '82.00',
            pricing_confidence: 0.87,
            rationale_summary: 'Strong recent comparables.',
            market_signals: ['brand strength'],
            comparable_results: [],
            inserted_at: '2026-04-01T00:00:00Z',
            updated_at: '2026-04-01T00:00:00Z',
          },
          marketplace_listings: [
            {
              id: 1,
              marketplace: 'ebay',
              status: 'generated',
              generated_title: 'Nike Air Max 90 Men Size 10',
              generated_description: 'Great condition pair.',
              generated_tags: ['nike', 'sneakers'],
              generated_price_suggestion: '84.00',
              generation_version: 'v1',
              compliance_warnings: [],
              last_generated_at: '2026-04-01T00:00:00Z',
              inserted_at: '2026-04-01T00:00:00Z',
              updated_at: '2026-04-01T00:00:00Z',
            },
          ],
          images: [
            {
              id: 101,
              kind: 'original',
              position: 1,
              storage_key: 'users/1/products/11/original.jpg',
              content_type: 'image/jpeg',
              width: 1200,
              height: 1600,
              byte_size: 120000,
              checksum: 'abc',
              background_style: null,
              processing_status: 'ready',
              original_filename: 'shoe.jpg',
              lifestyle_generation_run_id: null,
              scene_key: null,
              variant_index: null,
              source_image_ids: [],
              seller_approved: false,
              approved_at: null,
              inserted_at: '2026-04-01T00:00:00Z',
              updated_at: '2026-04-01T00:00:00Z',
            },
            {
              id: 102,
              kind: 'background_removed',
              position: 1,
              storage_key: 'users/1/products/11/background.png',
              content_type: 'image/png',
              width: 1200,
              height: 1600,
              byte_size: 110000,
              checksum: 'def',
              background_style: null,
              processing_status: 'ready',
              original_filename: 'shoe-bg.png',
              lifestyle_generation_run_id: null,
              scene_key: null,
              variant_index: null,
              source_image_ids: [101],
              seller_approved: false,
              approved_at: null,
              inserted_at: '2026-04-01T00:00:00Z',
              updated_at: '2026-04-01T00:00:00Z',
            },
          ],
        },
      },
    });
  });

  it('loads product detail on mount', async () => {
    const { result } = renderHook(() => useProductDetail('token-123', 11));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetProduct).toHaveBeenCalledWith('token-123', 11);
    expect(result.current.product?.title).toBe('Nike Air Max 90');
    expect(result.current.product?.images).toHaveLength(2);
  });

  it('refreshes product detail on demand', async () => {
    const { result } = renderHook(() => useProductDetail('token-123', 11));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(mockedGetProduct).toHaveBeenCalledTimes(2);
    });
  });
});
