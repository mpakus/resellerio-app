import {
  buildPublicAppUrl,
  buildStorefrontUrl,
  selectedStorefrontTheme,
  storefrontAssetDetails,
  storefrontThemePreviewSwatches,
  subscriptionDetailsSummary,
  visibleStorefrontThemes,
} from '@/src/features/settings/helpers';

describe('settings helpers', () => {
  it('describes storefront assets with preview-ready copy', () => {
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
    ).toBe('Preview ready');
  });

  it('returns selected theme and visible theme subset', () => {
    const themes = [
      { id: 'desert-clay', label: 'Desert Clay', colors: { text: '#111111' } },
      { id: 'linen-ink', label: 'Linen Ink', colors: { text: '#222222' } },
      { id: 'forest-study', label: 'Forest Study', colors: { text: '#333333' } },
    ];

    expect(selectedStorefrontTheme(themes, 'forest-study')?.label).toBe('Forest Study');
    expect(visibleStorefrontThemes(themes, false, 'forest-study').map((theme) => theme.id)).toEqual([
      'desert-clay',
      'forest-study',
    ]);
    expect(visibleStorefrontThemes(themes, true, 'forest-study')).toHaveLength(3);
  });

  it('builds storefront theme swatches from the theme colors', () => {
    expect(
      storefrontThemePreviewSwatches({
        id: 'desert-clay',
        label: 'Desert Clay',
        colors: {
          primary_button: '#111111',
          secondary_accent: '#222222',
          page_background: '#333333',
          text: '#444444',
        },
      }),
    ).toEqual(['#111111', '#222222', '#333333', '#444444']);
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
