import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
  approveGeneratedImage,
  archiveProduct,
  deleteProduct,
  deleteGeneratedImage,
  generateLifestyleImages,
  getCurrentStorefront,
  getProduct,
  listLifestyleGenerationRuns,
  markProductSold,
  reprocessProduct,
  reorderStorefrontImages,
  unarchiveProduct,
  updateImageStorefront,
  updateProduct,
} from '@/src/features/products/api';
import { useProductDetail } from '@/src/features/products/use-product-detail';

jest.mock('@/src/features/products/api', () => ({
  getProduct: jest.fn(),
  getCurrentStorefront: jest.fn(),
  updateProduct: jest.fn(),
  reprocessProduct: jest.fn(),
  markProductSold: jest.fn(),
  archiveProduct: jest.fn(),
  unarchiveProduct: jest.fn(),
  deleteProduct: jest.fn(),
  generateLifestyleImages: jest.fn(),
  listLifestyleGenerationRuns: jest.fn(),
  approveGeneratedImage: jest.fn(),
  deleteGeneratedImage: jest.fn(),
  updateImageStorefront: jest.fn(),
  reorderStorefrontImages: jest.fn(),
  listProducts: jest.fn(),
  listProductTabs: jest.fn(),
  createProductTab: jest.fn(),
  updateProductTab: jest.fn(),
  deleteProductTab: jest.fn(),
}));

const mockedGetProduct = jest.mocked(getProduct);
const mockedGetCurrentStorefront = jest.mocked(getCurrentStorefront);
const mockedUpdateProduct = jest.mocked(updateProduct);
const mockedReprocessProduct = jest.mocked(reprocessProduct);
const mockedMarkProductSold = jest.mocked(markProductSold);
const mockedArchiveProduct = jest.mocked(archiveProduct);
const mockedUnarchiveProduct = jest.mocked(unarchiveProduct);
const mockedDeleteProduct = jest.mocked(deleteProduct);
const mockedGenerateLifestyleImages = jest.mocked(generateLifestyleImages);
const mockedListLifestyleGenerationRuns = jest.mocked(listLifestyleGenerationRuns);
const mockedApproveGeneratedImage = jest.mocked(approveGeneratedImage);
const mockedDeleteGeneratedImage = jest.mocked(deleteGeneratedImage);
const mockedUpdateImageStorefront = jest.mocked(updateImageStorefront);
const mockedReorderStorefrontImages = jest.mocked(reorderStorefrontImages);

describe('useProductDetail', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedListLifestyleGenerationRuns.mockResolvedValue({
      data: {
        runs: [],
      },
    });
    mockedGetCurrentStorefront.mockResolvedValue({
      data: {
        storefront: {
          id: 3,
          slug: 'my-store',
        },
      },
    } as never);

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
          storefront_enabled: true,
          storefront_published_at: '2026-04-01T00:00:00Z',
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
              external_url: 'https://www.ebay.com/itm/1234567890',
              external_url_added_at: '2026-04-01T00:10:00Z',
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
              url: 'https://cdn.example.test/users/1/products/11/original.jpg',
              content_type: 'image/jpeg',
              width: 1200,
              height: 1600,
              byte_size: 120000,
              checksum: 'abc',
              background_style: null,
              processing_status: 'ready',
              original_filename: 'shoe.jpg',
              storefront_visible: true,
              storefront_position: 1,
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
              url: 'https://cdn.example.test/users/1/products/11/background.png',
              content_type: 'image/png',
              width: 1200,
              height: 1600,
              byte_size: 110000,
              checksum: 'def',
              background_style: null,
              processing_status: 'ready',
              original_filename: 'shoe-bg.png',
              storefront_visible: false,
              storefront_position: null,
              lifestyle_generation_run_id: null,
              scene_key: null,
              variant_index: null,
              source_image_ids: [101],
              seller_approved: false,
              approved_at: null,
              inserted_at: '2026-04-01T00:00:00Z',
              updated_at: '2026-04-01T00:00:00Z',
            },
            {
              id: 103,
              kind: 'lifestyle_generated',
              position: 2,
              storage_key: 'users/1/products/11/lifestyle.jpg',
              url: 'https://cdn.example.test/users/1/products/11/lifestyle.jpg',
              content_type: 'image/jpeg',
              width: 1200,
              height: 1600,
              byte_size: 140000,
              checksum: 'ghi',
              background_style: null,
              processing_status: 'ready',
              original_filename: 'shoe-lifestyle.jpg',
              storefront_visible: false,
              storefront_position: null,
              lifestyle_generation_run_id: 9,
              scene_key: 'casual_lifestyle',
              variant_index: 1,
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
    expect(mockedGetCurrentStorefront).toHaveBeenCalledWith('token-123');
    expect(mockedListLifestyleGenerationRuns).toHaveBeenCalledWith('token-123', 11);
    expect(result.current.product?.title).toBe('Nike Air Max 90');
    expect(result.current.storefrontSlug).toBe('my-store');
    expect(result.current.product?.images).toHaveLength(3);
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

  it('saves product edits and updates local detail state', async () => {
    const { result } = renderHook(() => useProductDetail('token-123', 11));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockedUpdateProduct.mockResolvedValue({
      data: {
        product: {
          ...result.current.product,
          title: 'Updated title',
          tags: ['shell', 'winter'],
        } as never,
      },
    });

    await act(async () => {
      await result.current.saveProduct({
        product: {
          title: 'Updated title',
          tags: ['shell', 'winter'],
        },
      });
    });

    expect(mockedUpdateProduct).toHaveBeenCalledWith('token-123', 11, {
      product: {
        title: 'Updated title',
        tags: ['shell', 'winter'],
      },
    });
    expect(result.current.product?.title).toBe('Updated title');
    expect(result.current.isSaving).toBe(false);
  });

  it('polls automatically while processing is active and stops once the product is ready', async () => {
    mockedGetProduct
      .mockResolvedValueOnce({
        data: {
          product: {
            id: 11,
            status: 'processing',
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
            storefront_enabled: false,
            storefront_published_at: null,
            sku: 'NK-90',
            tags: ['air-max', 'vintage'],
            notes: 'Minor wear on heel',
            ai_summary: null,
            ai_confidence: null,
            sold_at: null,
            archived_at: null,
            inserted_at: '2026-04-01T00:00:00Z',
            updated_at: '2026-04-01T00:00:00Z',
            latest_processing_run: {
              id: 41,
              status: 'processing',
              step: 'background_removal',
              started_at: '2026-04-01T00:00:00Z',
              finished_at: null,
              error_code: null,
              error_message: null,
              inserted_at: '2026-04-01T00:00:00Z',
              updated_at: '2026-04-01T00:00:30Z',
              payload: {},
            },
            latest_lifestyle_generation_run: null,
            description_draft: null,
            price_research: null,
            marketplace_listings: [],
            images: [],
          },
        },
      })
      .mockResolvedValueOnce({
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
            storefront_enabled: false,
            storefront_published_at: null,
            sku: 'NK-90',
            tags: ['air-max', 'vintage'],
            notes: 'Minor wear on heel',
            ai_summary: 'Ready for review.',
            ai_confidence: 0.9,
            sold_at: null,
            archived_at: null,
            inserted_at: '2026-04-01T00:00:00Z',
            updated_at: '2026-04-01T00:01:00Z',
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
            description_draft: null,
            price_research: null,
            marketplace_listings: [],
            images: [],
          },
        },
      });

    const { result } = renderHook(() => useProductDetail('token-123', 11));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isPolling).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockedGetProduct).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.product?.status).toBe('review');
    });

    expect(result.current.isPolling).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockedGetProduct).toHaveBeenCalledTimes(2);
  });

  it('restarts processing and updates the product state', async () => {
    mockedReprocessProduct.mockResolvedValue({
      data: {
        product: {
          id: 11,
          status: 'processing',
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
          product_tab: { id: 7, name: 'Shoes', position: 1 },
          storefront_enabled: false,
          storefront_published_at: null,
          sku: 'NK-90',
          tags: ['air-max', 'vintage'],
          notes: 'Minor wear on heel',
          ai_summary: null,
          ai_confidence: null,
          sold_at: null,
          archived_at: null,
          inserted_at: '2026-04-01T00:00:00Z',
          updated_at: '2026-04-01T00:00:00Z',
          latest_processing_run: {
            id: 99,
            status: 'queued',
            step: 'queued',
            started_at: '2026-04-01T00:02:00Z',
            finished_at: null,
            error_code: null,
            error_message: null,
            inserted_at: '2026-04-01T00:02:00Z',
            updated_at: '2026-04-01T00:02:00Z',
            payload: {},
          },
          latest_lifestyle_generation_run: null,
          description_draft: null,
          price_research: null,
          marketplace_listings: [],
          images: [],
        } as never,
        processing_run: {
          id: 99,
          status: 'queued',
          step: 'queued',
          started_at: '2026-04-01T00:02:00Z',
          finished_at: null,
          error_code: null,
          error_message: null,
          inserted_at: '2026-04-01T00:02:00Z',
          updated_at: '2026-04-01T00:02:00Z',
          payload: {},
        },
      },
    });

    const { result } = renderHook(() => useProductDetail('token-123', 11));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.retryProcessing();
    });

    expect(mockedReprocessProduct).toHaveBeenCalledWith('token-123', 11);
    expect(result.current.product?.status).toBe('processing');
    expect(result.current.isReprocessing).toBe(false);
  });

  it('runs sold/archive/restore lifecycle mutations through the dedicated endpoints', async () => {
    const { result } = renderHook(() => useProductDetail('token-123', 11));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockedMarkProductSold.mockResolvedValue({
      data: {
        product: {
          ...result.current.product,
          status: 'sold',
          sold_at: '2026-04-01T00:02:00Z',
        } as never,
      },
    });

    await act(async () => {
      await result.current.markSold();
    });

    expect(result.current.product?.status).toBe('sold');

    mockedArchiveProduct.mockResolvedValue({
      data: {
        product: {
          ...result.current.product,
          status: 'archived',
          archived_at: '2026-04-01T00:03:00Z',
        } as never,
      },
    });

    await act(async () => {
      await result.current.archive();
    });

    expect(result.current.product?.status).toBe('archived');

    mockedUnarchiveProduct.mockResolvedValue({
      data: {
        product: {
          ...result.current.product,
          status: 'sold',
          archived_at: null,
        } as never,
      },
    });

    await act(async () => {
      await result.current.unarchive();
    });

    expect(mockedMarkProductSold).toHaveBeenCalledWith('token-123', 11);
    expect(mockedArchiveProduct).toHaveBeenCalledWith('token-123', 11);
    expect(mockedUnarchiveProduct).toHaveBeenCalledWith('token-123', 11);
    expect(result.current.product?.status).toBe('sold');
  });

  it('deletes the product through the delete endpoint', async () => {
    mockedDeleteProduct.mockResolvedValue({
      data: {
        deleted: true,
      },
    });

    const { result } = renderHook(() => useProductDetail('token-123', 11));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let deleted = false;

    await act(async () => {
      deleted = await result.current.removeProduct();
    });

    expect(mockedDeleteProduct).toHaveBeenCalledWith('token-123', 11);
    expect(deleted).toBe(true);
    expect(result.current.isDeleting).toBe(false);
  });

  it('loads lifestyle run history and generates a new lifestyle run', async () => {
    const queuedRun = {
      id: 10,
      status: 'queued',
      step: 'queued',
      scene_family: 'apparel',
      model: 'model-1',
      prompt_version: 'v1',
      requested_count: 3,
      completed_count: 0,
      started_at: '2026-04-01T00:12:00Z',
      finished_at: null,
      error_code: null,
      error_message: null,
      inserted_at: '2026-04-01T00:12:00Z',
      updated_at: '2026-04-01T00:12:00Z',
      payload: {},
    };

    mockedListLifestyleGenerationRuns
      .mockResolvedValueOnce({
        data: {
          runs: [
            {
              id: 9,
              status: 'completed',
              step: 'lifestyle_generated',
              scene_family: 'apparel',
              model: 'model-1',
              prompt_version: 'v1',
              requested_count: 2,
              completed_count: 2,
              started_at: '2026-04-01T00:10:00Z',
              finished_at: '2026-04-01T00:11:00Z',
              error_code: null,
              error_message: null,
              inserted_at: '2026-04-01T00:10:00Z',
              updated_at: '2026-04-01T00:11:00Z',
              payload: {},
            },
          ],
        },
      })
      .mockResolvedValue({
        data: {
          runs: [queuedRun],
        },
      });

    const { result } = renderHook(() => useProductDetail('token-123', 11));

    await waitFor(() => {
      expect(result.current.isLoadingLifestyleRuns).toBe(false);
    });

    expect(result.current.lifestyleRuns).toHaveLength(1);

    mockedGenerateLifestyleImages.mockResolvedValue({
      data: {
        product: {
          ...result.current.product,
          latest_lifestyle_generation_run: queuedRun,
        } as never,
        lifestyle_generation_run: queuedRun,
      },
    });

    await act(async () => {
      await result.current.generateLifestyle();
    });

    expect(mockedGenerateLifestyleImages).toHaveBeenCalledWith('token-123', 11, undefined);
    await waitFor(() => {
      expect(mockedListLifestyleGenerationRuns).toHaveBeenCalledTimes(2);
    });
  });

  it('passes a scene key when regenerating one lifestyle scene', async () => {
    const { result } = renderHook(() => useProductDetail('token-123', 11));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockedGenerateLifestyleImages.mockResolvedValue({
      data: {
        product: {
          ...result.current.product,
        } as never,
        lifestyle_generation_run: null,
      },
    });

    await act(async () => {
      await result.current.generateLifestyle('casual_lifestyle');
    });

    expect(mockedGenerateLifestyleImages).toHaveBeenCalledWith(
      'token-123',
      11,
      'casual_lifestyle',
    );
  });

  it('approves and deletes generated lifestyle images', async () => {
    const { result } = renderHook(() => useProductDetail('token-123', 11));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockedApproveGeneratedImage.mockResolvedValue({
      data: {
        product: {
          ...result.current.product,
          images: result.current.product?.images.map((image) =>
            image.id === 103
              ? { ...image, seller_approved: true, approved_at: '2026-04-01T00:12:00Z' }
              : image,
          ),
        } as never,
      },
    });

    await act(async () => {
      await result.current.approveLifestyleImage(103);
    });

    expect(mockedApproveGeneratedImage).toHaveBeenCalledWith('token-123', 11, 103);

    mockedDeleteGeneratedImage.mockResolvedValue({
      data: {
        product: {
          ...result.current.product,
          images: result.current.product?.images.filter((image) => image.id !== 103),
        } as never,
        deleted: true,
      },
    });

    await act(async () => {
      await result.current.deleteLifestyleImage(103);
    });

    expect(mockedDeleteGeneratedImage).toHaveBeenCalledWith('token-123', 11, 103);
  });

  it('updates storefront visibility and reorders storefront images', async () => {
    const { result } = renderHook(() => useProductDetail('token-123', 11));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockedUpdateImageStorefront.mockResolvedValue({
      data: {
        product: {
          ...result.current.product,
          images: result.current.product?.images.map((image) =>
            image.id === 102
              ? { ...image, storefront_visible: true, storefront_position: 2 }
              : image,
          ),
        } as never,
      },
    });

    await act(async () => {
      await result.current.setImageStorefrontVisibility(102, true, 2);
    });

    expect(mockedUpdateImageStorefront).toHaveBeenCalledWith('token-123', 11, 102, {
      storefront_visible: true,
      storefront_position: 2,
    });

    mockedReorderStorefrontImages.mockResolvedValue({
      data: {
        product: result.current.product as never,
      },
    });

    await act(async () => {
      await result.current.saveStorefrontImageOrder([102, 101]);
    });

    expect(mockedReorderStorefrontImages).toHaveBeenCalledWith('token-123', 11, [102, 101]);
  });
});
