import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useProductPublicationForm } from '@/src/features/products/use-product-publication-form';

describe('useProductPublicationForm', () => {
  const product = {
    id: 11,
    updated_at: '2026-04-02T16:00:00Z',
    storefront_enabled: true,
    storefront_published_at: '2026-04-02T15:30:00Z',
    marketplace_listings: [
      {
        marketplace: 'ebay',
        external_url: 'https://www.ebay.com/itm/1234567890',
      },
    ],
  };

  it('tracks draft changes and saves storefront publication fields', async () => {
    const onSave = jest.fn().mockResolvedValue({
      ...product,
      storefront_enabled: false,
      marketplace_listings: [
        {
          marketplace: 'ebay',
          external_url: 'https://www.ebay.com/itm/999',
        },
      ],
    } as never);

    const { result } = renderHook(() =>
      useProductPublicationForm({
        product: product as never,
        onSave,
      }),
    );

    await waitFor(() => {
      expect(result.current.draft).not.toBeNull();
    });

    act(() => {
      result.current.updateStorefrontEnabled(false);
      result.current.updateMarketplaceUrl('ebay', 'https://www.ebay.com/itm/999');
    });

    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      await result.current.save();
    });

    expect(onSave).toHaveBeenCalledWith({
      product: {
        storefront_enabled: false,
      },
      marketplace_external_urls: {
        ebay: 'https://www.ebay.com/itm/999',
      },
    });
    expect(result.current.isDirty).toBe(false);
  });
});
