import {
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
      subscriptionDetailsSummary('https://resellerio.com/store/my-store', {
        plan_status: 'active',
        plan_period: 'monthly',
        plan_expires_at: '2026-05-01T00:00:00Z',
        trial_ends_at: null,
      }),
    ).toBe('active · monthly · renews 2026-05-01T00:00:00Z · https://resellerio.com/store/my-store');
  });

  it('builds a storefront URL when a slug is available', () => {
    expect(buildStorefrontUrl('my-store', 'https://resellerio.com')).toBe(
      'https://resellerio.com/store/my-store',
    );
    expect(buildStorefrontUrl(null, 'https://resellerio.com')).toBeNull();
  });
});
