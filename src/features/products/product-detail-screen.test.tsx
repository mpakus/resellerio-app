import { render, screen } from '@testing-library/react-native';

import ProductDetailScreen from '@/app/(app)/products/[id]';
import { useProductDetail } from '@/src/features/products/use-product-detail';
import { useProductReviewForm } from '@/src/features/products/use-product-review-form';
import { useProductTabs } from '@/src/features/products/use-product-tabs';
import { useAuth } from '@/src/lib/auth/auth-provider';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
  Stack: {
    Screen: () => null,
  },
  useLocalSearchParams: () => ({
    id: '11',
  }),
}));

jest.mock('@/src/lib/auth/auth-provider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/src/features/products/use-product-detail', () => ({
  useProductDetail: jest.fn(),
}));

jest.mock('@/src/features/products/use-product-review-form', () => ({
  useProductReviewForm: jest.fn(),
}));

jest.mock('@/src/features/products/use-product-tabs', () => ({
  useProductTabs: jest.fn(),
}));

jest.mock('@expo/vector-icons/Ionicons', () => {
  return 'Ionicons';
});

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseProductDetail = jest.mocked(useProductDetail);
const mockedUseProductReviewForm = jest.mocked(useProductReviewForm);
const mockedUseProductTabs = jest.mocked(useProductTabs);

describe('ProductDetailScreen panels', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      status: 'authenticated',
      session: {
        token: 'token-123',
        expiresAt: null,
        user: {
          id: 1,
          email: 'seller@reseller.local',
          confirmed_at: null,
          selected_marketplaces: [],
          plan: 'free',
          plan_status: 'free',
          plan_period: null,
          plan_expires_at: null,
          trial_ends_at: null,
          addon_credits: {},
        },
        supportedMarketplaces: [],
        usage: {
          ai_drafts: 0,
          background_removals: 0,
          lifestyle: 0,
          price_research: 0,
        },
        limits: {
          ai_drafts: 25,
          background_removals: 25,
          lifestyle: 10,
          price_research: 25,
        },
      },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });

    mockedUseProductDetail.mockReturnValue({
      product: {
        id: 11,
        status: 'ready',
        source: 'manual',
        title: 'Nike Air Max 90',
        brand: 'Nike',
        category: 'Sneakers',
        price: '84.00',
        updated_at: '2026-04-02T15:30:00Z',
        product_tab: {
          id: 7,
          name: 'Shoes',
          position: 1,
        },
        condition: 'Good',
        color: 'White',
        size: '10',
        material: 'Leather',
        cost: '30.00',
        product_tab_id: 7,
        sku: 'NK-90',
        tags: ['air-max', 'vintage'],
        notes: 'Minor wear on heel',
        storefront_enabled: true,
        storefront_published_at: '2026-04-02T15:30:00Z',
        ai_summary: 'Vintage Nike sneakers with strong resale appeal.',
        ai_confidence: 0.91,
        sold_at: null,
        archived_at: null,
        inserted_at: '2026-04-01T00:00:00Z',
        latest_processing_run: {
          id: 41,
          status: 'completed',
          step: 'variants_generated',
          started_at: '2026-04-02T15:00:00Z',
          finished_at: '2026-04-02T15:20:00Z',
          error_code: null,
          error_message: null,
          inserted_at: '2026-04-02T15:00:00Z',
          updated_at: '2026-04-02T15:20:00Z',
          payload: {},
        },
        latest_lifestyle_generation_run: null,
        description_draft: {
          id: 8,
          status: 'completed',
          provider: 'gemini',
          model: 'model-1',
          suggested_title: 'Nike Air Max 90 Vintage Sneakers',
          short_description: 'Classic white sneakers cleaned and ready for resale.',
          long_description: 'Full long description here.',
          key_features: ['Leather upper', 'Visible Air unit'],
          seo_keywords: ['Nike', 'Air Max 90'],
          missing_details_warning: null,
          inserted_at: '2026-04-02T15:10:00Z',
          updated_at: '2026-04-02T15:11:00Z',
        },
        price_research: {
          id: 4,
          status: 'completed',
          provider: 'gemini',
          model: 'model-1',
          currency: 'USD',
          suggested_min_price: '70.00',
          suggested_target_price: '84.00',
          suggested_max_price: '96.00',
          suggested_median_price: '82.00',
          pricing_confidence: 0.87,
          rationale_summary: 'Recent comps are strong for this colorway and condition.',
          market_signals: ['brand strength', 'seasonal demand'],
          comparable_results: [],
          inserted_at: '2026-04-02T15:10:00Z',
          updated_at: '2026-04-02T15:11:00Z',
        },
        marketplace_listings: [
          {
            id: 9,
            marketplace: 'ebay',
            status: 'generated',
            generated_title: 'Nike Air Max 90 Men Size 10',
            generated_description: 'Great condition pair.',
            generated_tags: ['nike', 'sneakers'],
            generated_price_suggestion: '84.00',
            generation_version: 'v1',
            compliance_warnings: ['Verify condition notes'],
            external_url: 'https://www.ebay.com/itm/1234567890',
            external_url_added_at: '2026-04-02T15:40:00Z',
            last_generated_at: '2026-04-02T15:12:00Z',
            inserted_at: '2026-04-02T15:12:00Z',
            updated_at: '2026-04-02T15:40:00Z',
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
            storefront_visible: true,
            storefront_position: 1,
            lifestyle_generation_run_id: null,
            scene_key: null,
            variant_index: null,
            source_image_ids: [],
            seller_approved: false,
            approved_at: null,
            inserted_at: '2026-04-02T15:10:00Z',
            updated_at: '2026-04-02T15:10:00Z',
          },
        ],
      },
      isLoading: false,
      isRefreshing: false,
      isSaving: false,
      isPolling: false,
      error: null,
      refresh: jest.fn(),
      saveProduct: jest.fn(),
      isReprocessing: false,
      isUpdatingLifecycle: false,
      isDeleting: false,
      retryProcessing: jest.fn(),
      markSold: jest.fn(),
      archive: jest.fn(),
      unarchive: jest.fn(),
      removeProduct: jest.fn().mockResolvedValue(true),
    });

    mockedUseProductTabs.mockReturnValue({
      productTabs: [],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    mockedUseProductReviewForm.mockReturnValue({
      draft: {
        title: 'Nike Air Max 90',
        brand: 'Nike',
        category: 'Sneakers',
        condition: 'Good',
        color: 'White',
        size: '10',
        material: 'Leather',
        price: '84.00',
        cost: '30.00',
        sku: 'NK-90',
        notes: 'Minor wear on heel',
        tagsText: 'air-max, vintage',
        status: 'ready',
        productTabId: 7,
      },
      isDirty: false,
      isSaving: false,
      error: null,
      updateField: jest.fn(),
      reset: jest.fn(),
      save: jest.fn(),
    });
  });

  it('renders storefront, description, price research, and marketplace panels from the product payload', () => {
    render(<ProductDetailScreen />);

    expect(screen.getByText('Published to storefront')).toBeTruthy();
    expect(screen.getByText('Vintage Nike sneakers with strong resale appeal.')).toBeTruthy();
    expect(screen.getByText('Nike Air Max 90 Vintage Sneakers')).toBeTruthy();
    expect(screen.getByText('$84.00 target')).toBeTruthy();
    expect(screen.getByText('eBay · generated')).toBeTruthy();
    expect(screen.getByText('https://www.ebay.com/itm/1234567890')).toBeTruthy();
  });
});
