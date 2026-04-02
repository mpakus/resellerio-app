import {
  buildProductPublicationPayload,
  createProductPublicationDraft,
  productPublicationDraftEquals,
} from '@/src/features/products/publication-form';

describe('product publication form helpers', () => {
  it('builds a storefront publication draft from the product payload', () => {
    const draft = createProductPublicationDraft({
      storefront_enabled: true,
      marketplace_listings: [
        { marketplace: 'ebay', external_url: 'https://www.ebay.com/itm/123' },
        { marketplace: 'depop', external_url: null },
      ],
    } as never);

    expect(draft).toEqual({
      storefrontEnabled: true,
      marketplaceExternalUrls: {
        ebay: 'https://www.ebay.com/itm/123',
        depop: '',
      },
    });
  });

  it('maps publication draft changes into the API payload', () => {
    expect(
      buildProductPublicationPayload({
        storefrontEnabled: false,
        marketplaceExternalUrls: {
          ebay: 'https://www.ebay.com/itm/123',
          depop: '   ',
        },
      }),
    ).toEqual({
      product: {
        storefront_enabled: false,
      },
      marketplace_external_urls: {
        ebay: 'https://www.ebay.com/itm/123',
        depop: null,
      },
    });
  });

  it('compares publication drafts by value', () => {
    expect(
      productPublicationDraftEquals(
        {
          storefrontEnabled: true,
          marketplaceExternalUrls: { ebay: 'https://www.ebay.com/itm/123' },
        },
        {
          storefrontEnabled: true,
          marketplaceExternalUrls: { ebay: 'https://www.ebay.com/itm/123' },
        },
      ),
    ).toBe(true);
  });
});
