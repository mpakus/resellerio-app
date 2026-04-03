import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { Linking, Share } from 'react-native';

import ProductDetailScreen from '@/app/(app)/products/[id]';
import { useProductPublicationForm } from '@/src/features/products/use-product-publication-form';
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

jest.mock('@/src/features/products/use-product-publication-form', () => ({
  useProductPublicationForm: jest.fn(),
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

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseProductDetail = jest.mocked(useProductDetail);
const mockedUseProductPublicationForm = jest.mocked(useProductPublicationForm);
const mockedUseProductReviewForm = jest.mocked(useProductReviewForm);
const mockedUseProductTabs = jest.mocked(useProductTabs);
const mockedLinkingOpenURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
const mockedSetStringAsync = jest.mocked(Clipboard.setStringAsync);
const mockedShare = jest.spyOn(Share, 'share').mockResolvedValue({
  action: Share.sharedAction,
  activityType: undefined,
});
const mockGenerateLifestyle = jest.fn();
const mockApproveLifestyleImage = jest.fn();
const mockDeleteLifestyleImage = jest.fn();
const mockSetImageStorefrontVisibility = jest.fn();

describe('ProductDetailScreen panels', () => {
  beforeEach(() => {
    mockedLinkingOpenURL.mockClear();
    mockedSetStringAsync.mockClear();
    mockedSetStringAsync.mockResolvedValue(true);
    mockedShare.mockClear();
    mockGenerateLifestyle.mockReset();
    mockApproveLifestyleImage.mockReset();
    mockDeleteLifestyleImage.mockReset();
    mockSetImageStorefrontVisibility.mockReset();
  });

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
        image_urls: [
          'https://cdn.example.test/users/1/products/11/original.jpg',
          'https://cdn.example.test/users/1/products/11/lifestyle.jpg',
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
            inserted_at: '2026-04-02T15:10:00Z',
            updated_at: '2026-04-02T15:10:00Z',
          },
          {
            id: 201,
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
            original_filename: 'lifestyle.jpg',
            storefront_visible: false,
            storefront_position: null,
            lifestyle_generation_run_id: 19,
            scene_key: 'casual_lifestyle',
            variant_index: 1,
            source_image_ids: [101],
            seller_approved: false,
            approved_at: null,
            inserted_at: '2026-04-02T15:15:00Z',
            updated_at: '2026-04-02T15:15:00Z',
          },
        ],
      },
      storefrontSlug: 'my-store',
      isLoading: false,
      isLoadingLifestyleRuns: false,
      isRefreshing: false,
      isSaving: false,
      isPolling: false,
      error: null,
      lifestyleRuns: [
        {
          id: 19,
          status: 'completed',
          step: 'lifestyle_generated',
          scene_family: 'apparel',
          model: 'gemini-2.5-flash-image',
          prompt_version: 'v1',
          requested_count: 2,
          completed_count: 2,
          started_at: '2026-04-02T15:12:00Z',
          finished_at: '2026-04-02T15:15:00Z',
          error_code: null,
          error_message: null,
          inserted_at: '2026-04-02T15:12:00Z',
          updated_at: '2026-04-02T15:15:00Z',
          payload: {},
        },
      ],
      lifestyleRunsError: null,
      refresh: jest.fn(),
      refreshLifestyleRuns: jest.fn(),
      saveProduct: jest.fn(),
      isReprocessing: false,
      isUpdatingLifecycle: false,
      isGeneratingLifestyle: false,
      isUpdatingMedia: false,
      isDeleting: false,
      retryProcessing: jest.fn(),
      markSold: jest.fn(),
      archive: jest.fn(),
      unarchive: jest.fn(),
      removeProduct: jest.fn().mockResolvedValue(true),
      generateLifestyle: mockGenerateLifestyle,
      approveLifestyleImage: mockApproveLifestyleImage,
      deleteLifestyleImage: mockDeleteLifestyleImage,
      setImageStorefrontVisibility: mockSetImageStorefrontVisibility,
      saveStorefrontImageOrder: jest.fn(),
    });

    mockedUseProductPublicationForm.mockReturnValue({
      draft: {
        storefrontEnabled: true,
        marketplaceExternalUrls: {
          ebay: 'https://www.ebay.com/itm/1234567890',
        },
      },
      isDirty: false,
      isSaving: false,
      error: null,
      updateStorefrontEnabled: jest.fn(),
      updateMarketplaceUrl: jest.fn(),
      reset: jest.fn(),
      save: jest.fn(),
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
    expect(screen.getByText('Regenerate all scenes')).toBeTruthy();
    expect(screen.getByText('Lifestyle image #201')).toBeTruthy();
    expect(screen.getByText('Regenerate Casual Lifestyle')).toBeTruthy();
    expect(screen.getByLabelText('Open lifestyle image 201')).toBeTruthy();
    expect(screen.getByLabelText('Regenerate lifestyle image 201')).toBeTruthy();
    expect(screen.getByLabelText('Approve lifestyle image 201')).toBeTruthy();
    expect(screen.getByLabelText('Delete lifestyle image 201')).toBeTruthy();
    expect(screen.getByText('STOREFRONT GALLERY')).toBeTruthy();
    expect(screen.getByLabelText('Add image 201 to storefront')).toBeTruthy();
    expect(screen.getByLabelText('Remove image 101 from storefront')).toBeTruthy();
    expect(screen.getByText('ORIGINAL IMAGES')).toBeTruthy();
    expect(screen.getAllByText('Open Image in Browser').length).toBeGreaterThan(0);
    expect(screen.queryByText('Draft status')).toBeNull();
    expect(screen.queryByText('Storefront visibility')).toBeNull();
    expect(screen.queryByText('Save storefront settings')).toBeNull();
    expect(screen.queryByText('Product fields snapshot')).toBeNull();
    expect(screen.queryByText('Filename')).toBeNull();
    expect(screen.queryByText('Ready for storefront')).toBeNull();
    expect(screen.queryByText('Position')).toBeNull();
    expect(screen.queryByText('Add to storefront')).toBeNull();
    expect(screen.queryByText('Remove from storefront')).toBeNull();
    expect(screen.queryByText('Scene')).toBeNull();
    expect(screen.queryByText('Approved')).toBeNull();
    expect(screen.queryByText('Source images')).toBeNull();
    expect(screen.queryByText('Scene casual_lifestyle')).toBeNull();
    expect(screen.queryByText('Scene model_studio')).toBeNull();
    expect(screen.getByLabelText('Move image 101 up')).toBeTruthy();
    expect(screen.getByLabelText('Move image 101 down')).toBeTruthy();
    expect(screen.getAllByText('Products').length).toBeGreaterThan(0);
    expect(
      screen.getByText('Review product data, monitor AI processing, and manage the seller workflow.'),
    ).toBeTruthy();
    expect(screen.getByText('Managed product fields')).toBeTruthy();
  });

  it('opens and shares the public storefront URL', async () => {
    render(<ProductDetailScreen />);

    expect(
      screen.queryByText('http://localhost:4000/store/my-store/products/11-nike-air-max-90'),
    ).toBeNull();

    fireEvent.press(screen.getByText('Open'));
    fireEvent.press(screen.getByText('Share'));

    expect(mockedLinkingOpenURL).toHaveBeenCalledWith(
      'http://localhost:4000/store/my-store/products/11-nike-air-max-90',
    );
    expect(mockedShare).toHaveBeenCalledWith({
      message: 'http://localhost:4000/store/my-store/products/11-nike-air-max-90',
      url: 'http://localhost:4000/store/my-store/products/11-nike-air-max-90',
    });
  });

  it('opens image and marketplace URLs in the browser from link actions', () => {
    render(<ProductDetailScreen />);

    fireEvent.press(screen.getAllByText('Open Image in Browser')[0]);
    fireEvent.press(screen.getByText('Open marketplace URL'));

    expect(mockedLinkingOpenURL).toHaveBeenCalledWith(
      'https://cdn.example.test/users/1/products/11/original.jpg',
    );
    expect(mockedLinkingOpenURL).toHaveBeenCalledWith('https://www.ebay.com/itm/1234567890');
  });

  it('copies marketplace listing text blocks to the clipboard', async () => {
    render(<ProductDetailScreen />);

    await act(async () => {
      fireEvent.press(screen.getAllByLabelText('Copy Title')[1]);
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Copy Suggested price'));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Copy Live URL'));
    });

    expect(mockedSetStringAsync).toHaveBeenCalledWith('Nike Air Max 90 Men Size 10');
    expect(mockedSetStringAsync).toHaveBeenCalledWith('$84.00');
    expect(mockedSetStringAsync).toHaveBeenCalledWith('https://www.ebay.com/itm/1234567890');
  });

  it('starts scene-specific lifestyle regeneration from the shortcut button', () => {
    render(<ProductDetailScreen />);

    fireEvent.press(screen.getByText('Regenerate Casual Lifestyle'));

    expect(mockGenerateLifestyle).toHaveBeenCalledWith('casual_lifestyle');
  });

  it('uses icon actions for per-image lifestyle controls', () => {
    render(<ProductDetailScreen />);

    expect(screen.queryByText('Approve')).toBeNull();
    expect(screen.queryByText('Delete')).toBeNull();
    expect(screen.queryByText('Preview full screen')).toBeNull();
    expect(screen.queryByLabelText('Preview lifestyle image 201')).toBeNull();
    expect(screen.getByLabelText('Regenerate lifestyle image 201')).toBeTruthy();
  });

  it('opens a lifestyle image when the seller taps the photo', () => {
    render(<ProductDetailScreen />);

    fireEvent.press(screen.getByLabelText('Open lifestyle image 201'));

    expect(screen.getByText('Lifestyle · #201')).toBeTruthy();
    expect(screen.getByText('https://cdn.example.test/users/1/products/11/lifestyle.jpg')).toBeTruthy();
  });

  it('runs approve from the lifestyle icon control and keeps approved state one-way', () => {
    render(<ProductDetailScreen />);

    fireEvent.press(screen.getByLabelText('Approve lifestyle image 201'));

    expect(mockApproveLifestyleImage).toHaveBeenCalledWith(201);
    expect(screen.queryByLabelText('Unapprove lifestyle image 201')).toBeNull();
  });

  it('hides regenerate once a lifestyle image is already approved', () => {
    const baseState = mockedUseProductDetail('token-123', 11);

    mockedUseProductDetail.mockReturnValue({
      ...baseState,
      product: {
        ...baseState.product!,
        images: baseState.product!.images.map((image) =>
          image.id === 201
            ? {
                ...image,
                seller_approved: true,
                approved_at: '2026-04-02T15:20:00Z',
              }
            : image,
        ),
      },
    });

    render(<ProductDetailScreen />);

    expect(screen.queryByLabelText('Regenerate lifestyle image 201')).toBeNull();
    expect(screen.getByLabelText('Lifestyle image 201 approved')).toBeTruthy();
  });

  it('asks for confirmation before deleting a lifestyle image', () => {
    render(<ProductDetailScreen />);

    fireEvent.press(screen.getByLabelText('Delete lifestyle image 201'));

    expect(screen.getByText('Delete lifestyle image?')).toBeTruthy();
    expect(mockDeleteLifestyleImage).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Cancel'));

    expect(screen.queryByText('Delete lifestyle image?')).toBeNull();
    expect(mockDeleteLifestyleImage).not.toHaveBeenCalled();
  });

  it('deletes a lifestyle image after confirmation', () => {
    render(<ProductDetailScreen />);

    fireEvent.press(screen.getByLabelText('Delete lifestyle image 201'));
    fireEvent.press(screen.getByText('Delete'));

    expect(mockDeleteLifestyleImage).toHaveBeenCalledWith(201);
  });

  it('toggles storefront image selection from the top-right circle control', () => {
    render(<ProductDetailScreen />);

    fireEvent.press(screen.getByLabelText('Add image 201 to storefront'));
    fireEvent.press(screen.getByLabelText('Remove image 101 from storefront'));

    expect(mockSetImageStorefrontVisibility).toHaveBeenCalledWith(201, true, 2);
    expect(mockSetImageStorefrontVisibility).toHaveBeenCalledWith(101, false, null);
  });

  it('keeps storefront gallery images in one list while using overlay toggles', () => {
    render(<ProductDetailScreen />);

    expect(screen.getByText('original · #101')).toBeTruthy();
    expect(screen.getByText('lifestyle_generated · #201')).toBeTruthy();
    expect(screen.queryByText('No ready images are available for storefront yet.')).toBeNull();
  });
});
