import {
  buildPublicAppUrl,
  buildStorefrontUrl,
  storefrontAssetDetails,
  subscriptionDetailsSummary,
} from '@/src/features/settings/helpers';

describe('settings helpers', () => {
  it('describes storefront assets with filename and dimensions', () => {
    expect(
      storefrontAssetDetails({
        id: 9,
        kind: 'logo',
        storage_key: 'users/1/logo.png',
        content_type: 'image/png',
        original_filename: 'logo.png',
        width: 400,
        height: 200,
        byte_size: 4000,
        inserted_at: null,
        updated_at: null,
      }),
    ).toBe('logo.png · 400x200');
  });

  it('builds a compact subscription summary', () => {
    expect(
      subscriptionDetailsSummary({
        plan_status: 'active',
        plan_period: 'monthly',
        plan_expires_at: '2026-05-01T00:00:00Z',
        trial_ends_at: null,
      }),
    ).toBe('active · monthly · renews 2026-05-01T00:00:00Z');
  });

  it('builds a storefront URL when a slug is available', () => {
    expect(buildStorefrontUrl('my-store', 'https://resellerio.com')).toBe(
      'https://resellerio.com/store/my-store',
    );
    expect(buildStorefrontUrl(null, 'https://resellerio.com')).toBeNull();
  });

  it('builds a public URL from either a relative path or absolute URL', () => {
    expect(buildPublicAppUrl('/store/my-store/products/11-shoes', 'https://resellerio.com')).toBe(
      'https://resellerio.com/store/my-store/products/11-shoes',
    );
    expect(buildPublicAppUrl('https://cdn.example.test/image.jpg', 'https://resellerio.com')).toBe(
      'https://cdn.example.test/image.jpg',
    );
  });
});
