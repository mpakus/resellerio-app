import {
  advancedProductFiltersSummary,
  buildProductsQuery,
  buildStorefrontProductUrl,
  buildReorderedStorefrontImageIds,
  collectLifestyleSceneKeys,
  filterRenderableImages,
  formatConfidenceScore,
  formatCurrencyAmount,
  formatMarketplaceName,
  formatProductDetailTimestamp,
  humanizeSceneKey,
  marketplaceListingHeadline,
  processingRunDescription,
  productSearchSummary,
  sanitizeProcessingErrorMessage,
  sortStorefrontImages,
  storefrontPublicationSummary,
  storefrontSelectionCount,
} from '@/src/features/products/helpers';

describe('product detail presentation helpers', () => {
  it('counts explicitly selected storefront images', () => {
    expect(
      storefrontSelectionCount([
        { storefront_visible: true },
        { storefront_visible: false },
        { storefront_visible: true },
      ]),
    ).toBe(2);
  });

  it('sorts storefront images by storefront position then upload position', () => {
    expect(
      sortStorefrontImages([
        {
          id: 'img-3',
          processing_status: 'ready',
          storefront_visible: true,
          storefront_position: 2,
          position: 3,
        },
        {
          id: 'img-2',
          processing_status: 'ready',
          storefront_visible: true,
          storefront_position: 1,
          position: 2,
        },
        {
          id: 'img-1',
          processing_status: 'processing',
          storefront_visible: true,
          storefront_position: 3,
          position: 1,
        },
      ] as never),
    ).toEqual([
      expect.objectContaining({ id: 'img-2' }),
      expect.objectContaining({ id: 'img-3' }),
    ]);
  });

  it('moves storefront image ids earlier or later', () => {
    expect(buildReorderedStorefrontImageIds(['img-10', 'img-20', 'img-30'], 'img-20', 'earlier')).toEqual(['img-20', 'img-10', 'img-30']);
    expect(buildReorderedStorefrontImageIds(['img-10', 'img-20', 'img-30'], 'img-20', 'later')).toEqual(['img-10', 'img-30', 'img-20']);
    expect(buildReorderedStorefrontImageIds(['img-10', 'img-20', 'img-30'], 'img-10', 'earlier')).toEqual(['img-10', 'img-20', 'img-30']);
  });

  it('formats timestamps, confidence, and currency for detail panels', () => {
    expect(formatProductDetailTimestamp('2026-04-02T15:30:00Z')).toContain('2026');
    expect(formatConfidenceScore(0.87)).toBe('87%');
    expect(formatConfidenceScore(null)).toBe('Not available');
    expect(formatCurrencyAmount('125.00')).toBe('$125.00');
    expect(formatCurrencyAmount('125.00', 'EUR')).toBe('EUR 125.00');
    expect(formatCurrencyAmount(null)).toBe('Not available');
  });

  it('summarizes storefront publication state', () => {
    expect(
      storefrontPublicationSummary({
        storefront_enabled: false,
        storefront_published_at: null,
      }),
    ).toBe('Storefront publishing is currently disabled for this product.');

    expect(
      storefrontPublicationSummary({
        storefront_enabled: true,
        storefront_published_at: null,
      }),
    ).toBe('Storefront publishing is enabled, but this product has not been published yet.');
  });

  it('formats marketplace labels for listing cards', () => {
    expect(formatMarketplaceName('ebay')).toBe('eBay');
    expect(formatMarketplaceName('facebook_marketplace')).toBe('Facebook Marketplace');
    expect(
      marketplaceListingHeadline({
        marketplace: 'mercari',
        status: 'generated',
      }),
    ).toBe('Mercari · generated');
  });

  it('builds the public storefront product URL and filters previewable images', () => {
    expect(
      buildStorefrontProductUrl('my-store', {
        id: 'prod-11',
        title: 'Nike Air Max 90',
      } as never, 'https://resellerio.com'),
    ).toBe('https://resellerio.com/store/my-store/products/prod-11-nike-air-max-90');

    expect(
      filterRenderableImages([
        { id: 'img-1', kind: 'original', url: null, position: 2, storefront_position: null },
        { id: 'img-2', kind: 'original', url: 'https://cdn.example/original.jpg', position: 1, storefront_position: null },
        { id: 'img-3', kind: 'background_removed', url: 'https://cdn.example/processed.png', position: 1, storefront_position: null },
      ] as never, 'original'),
    ).toEqual([expect.objectContaining({ id: 'img-2' })]);
  });

  it('humanizes and collects lifestyle scene keys', () => {
    expect(humanizeSceneKey('casual_lifestyle')).toBe('Casual Lifestyle');
    expect(
      collectLifestyleSceneKeys([
        { scene_key: 'casual_lifestyle' },
        { scene_key: 'model_studio' },
        { scene_key: 'casual_lifestyle' },
        { scene_key: null },
      ] as never),
    ).toEqual(['casual_lifestyle', 'model_studio']);
  });

  it('builds product query strings with advanced filters', () => {
    expect(
      buildProductsQuery({
        status: 'ready',
        query: 'nike',
        productTabId: 'tab-7',
        updatedFrom: '2026-03-01',
        updatedTo: '2026-03-31',
        sort: 'price',
        dir: 'asc',
        page: 2,
      }),
    ).toBe(
      'status=ready&page=2&sort=price&dir=asc&query=nike&product_tab_id=tab-7&updated_from=2026-03-01&updated_to=2026-03-31',
    );

    expect(
      advancedProductFiltersSummary({
        sort: 'updated_at',
        dir: 'desc',
        updatedFrom: '',
        updatedTo: '',
      }),
    ).toBe('Sort Updated · Descending');
    expect(productSearchSummary('  nike air max  ')).toBe('Search: "nike air max"');
    expect(productSearchSummary('   ')).toBe('No active search');
  });

  it('sanitizes raw internal processing errors into seller-safe copy', () => {
    expect(
      sanitizeProcessingErrorMessage(
        '#Ecto.Changeset<action: :update, changes: %{title: "Monster High"}, errors: [color: {"should be at most %{count} character(s)", [count: 80]}], data: #Reseller.Catalog.Product<>, valid?: false>',
        'prepare_images',
      ),
    ).toBe(
      'AI processing could not save the generated product details during prepare images. Review the product fields and retry.',
    );
  });

  it('keeps friendly processing errors unchanged', () => {
    expect(
      sanitizeProcessingErrorMessage(
        'Gemini rate-limited the request. Try processing again in a moment.',
        'prepare_images',
      ),
    ).toBe('Gemini rate-limited the request. Try processing again in a moment.');
  });

  it('builds a clean processing panel description from the latest run', () => {
    expect(
      processingRunDescription({
        latest_processing_run: {
          error_message:
            '#Ecto.Changeset<action: :update, changes: %{title: "Monster High"}, errors: [color: {"should be at most %{count} character(s)", [count: 80]}], data: #Reseller.Catalog.Product<>, valid?: false>',
          step: 'prepare_images',
        },
      } as never),
    ).toBe(
      'AI processing could not save the generated product details during prepare images. Review the product fields and retry.',
    );
  });
});
