import {
  buildStorefrontProductUrl,
  buildReorderedStorefrontImageIds,
  filterRenderableImages,
  formatConfidenceScore,
  formatCurrencyAmount,
  formatMarketplaceName,
  formatProductDetailTimestamp,
  marketplaceListingHeadline,
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
          id: 3,
          processing_status: 'ready',
          storefront_visible: true,
          storefront_position: 2,
          position: 3,
        },
        {
          id: 2,
          processing_status: 'ready',
          storefront_visible: true,
          storefront_position: 1,
          position: 2,
        },
        {
          id: 1,
          processing_status: 'processing',
          storefront_visible: true,
          storefront_position: 3,
          position: 1,
        },
      ] as never),
    ).toEqual([
      expect.objectContaining({ id: 2 }),
      expect.objectContaining({ id: 3 }),
    ]);
  });

  it('moves storefront image ids earlier or later', () => {
    expect(buildReorderedStorefrontImageIds([10, 20, 30], 20, 'earlier')).toEqual([20, 10, 30]);
    expect(buildReorderedStorefrontImageIds([10, 20, 30], 20, 'later')).toEqual([10, 30, 20]);
    expect(buildReorderedStorefrontImageIds([10, 20, 30], 10, 'earlier')).toEqual([10, 20, 30]);
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
        id: 11,
        title: 'Nike Air Max 90',
      } as never, 'https://resellerio.com'),
    ).toBe('https://resellerio.com/store/my-store/products/11-nike-air-max-90');

    expect(
      filterRenderableImages([
        { id: 1, kind: 'original', url: null, position: 2, storefront_position: null },
        { id: 2, kind: 'original', url: 'https://cdn.example/original.jpg', position: 1, storefront_position: null },
        { id: 3, kind: 'background_removed', url: 'https://cdn.example/processed.png', position: 1, storefront_position: null },
      ] as never, 'original'),
    ).toEqual([expect.objectContaining({ id: 2 })]);
  });
});
