import {
  formatConfidenceScore,
  formatCurrencyAmount,
  formatMarketplaceName,
  formatProductDetailTimestamp,
  marketplaceListingHeadline,
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
});
