import { act, renderHook, waitFor } from '@testing-library/react-native';

import { getCurrentUsage, getCurrentUser } from '@/src/lib/api/auth';
import {
  createStorefrontPage,
  deleteStorefrontPage,
  getStorefront,
  listStorefrontPages,
  reorderStorefrontPages,
  updateMarketplacePreferences,
  updateStorefrontPage,
  upsertStorefront,
} from '@/src/features/settings/api';
import { useSettingsOverview } from '@/src/features/settings/use-settings-overview';

jest.mock('@/src/lib/api/auth', () => ({
  getCurrentUser: jest.fn(),
  getCurrentUsage: jest.fn(),
}));

jest.mock('@/src/features/settings/api', () => ({
  updateMarketplacePreferences: jest.fn(),
  getStorefront: jest.fn(),
  upsertStorefront: jest.fn(),
  listStorefrontPages: jest.fn(),
  createStorefrontPage: jest.fn(),
  updateStorefrontPage: jest.fn(),
  deleteStorefrontPage: jest.fn(),
  reorderStorefrontPages: jest.fn(),
}));

const mockedGetCurrentUser = jest.mocked(getCurrentUser);
const mockedGetCurrentUsage = jest.mocked(getCurrentUsage);
const mockedUpdateMarketplacePreferences = jest.mocked(updateMarketplacePreferences);
const mockedGetStorefront = jest.mocked(getStorefront);
const mockedUpsertStorefront = jest.mocked(upsertStorefront);
const mockedListStorefrontPages = jest.mocked(listStorefrontPages);
const mockedCreateStorefrontPage = jest.mocked(createStorefrontPage);
const mockedUpdateStorefrontPage = jest.mocked(updateStorefrontPage);
const mockedDeleteStorefrontPage = jest.mocked(deleteStorefrontPage);
const mockedReorderStorefrontPages = jest.mocked(reorderStorefrontPages);

describe('useSettingsOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetCurrentUser.mockResolvedValue({
      data: {
        user: {
          id: 1,
          email: 'seller@reseller.local',
          confirmed_at: null,
          selected_marketplaces: ['ebay', 'depop'],
          plan: 'starter',
          plan_status: 'active',
          plan_period: 'monthly',
          plan_expires_at: '2026-05-01T00:00:00Z',
          trial_ends_at: null,
          addon_credits: { lifestyle: 2 },
        },
        supported_marketplaces: [
          { id: 'ebay', label: 'eBay' },
          { id: 'depop', label: 'Depop' },
          { id: 'mercari', label: 'Mercari' },
        ],
      },
    });

    mockedGetCurrentUsage.mockResolvedValue({
      data: {
        usage: {
          ai_drafts: 4,
          background_removals: 2,
          lifestyle: 1,
          price_research: 3,
        },
        limits: {
          ai_drafts: 25,
          background_removals: 25,
          lifestyle: 10,
          price_research: 25,
        },
        addon_credits: { lifestyle: 2 },
      },
    });

    mockedGetStorefront.mockResolvedValue({
      data: {
        storefront: {
          id: 3,
          slug: 'my-store',
          title: 'My Store',
          tagline: 'Curated resale.',
          description: 'Secondhand fashion with fast shipping.',
          theme_id: 'neutral-warm',
          enabled: true,
          assets: [],
          pages: [],
          inserted_at: '2026-04-01T00:00:00Z',
          updated_at: '2026-04-01T00:00:00Z',
        },
      },
    });

    mockedListStorefrontPages.mockResolvedValue({
      data: {
        pages: [
          {
            id: 7,
            title: 'About',
            slug: 'about',
            menu_label: 'About',
            body: 'Welcome to my store.',
            position: 1,
            published: true,
            inserted_at: '2026-04-01T00:00:00Z',
            updated_at: '2026-04-01T00:00:00Z',
          },
        ],
      },
    });
  });

  it('loads account, usage, storefront, and pages on mount', async () => {
    const { result } = renderHook(() => useSettingsOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user.email).toBe('seller@reseller.local');
    expect(result.current.storefront.title).toBe('My Store');
    expect(result.current.storefrontPages).toHaveLength(1);
  });

  it('saves marketplace defaults', async () => {
    const { result } = renderHook(() => useSettingsOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.toggleMarketplace('mercari');
    });

    mockedUpdateMarketplacePreferences.mockResolvedValue({
      data: {
        user: {
          ...result.current.user,
          selected_marketplaces: ['ebay', 'depop', 'mercari'],
        },
        supported_marketplaces: result.current.supportedMarketplaces,
      },
    });

    await act(async () => {
      await result.current.saveMarketplaceDraft();
    });

    expect(mockedUpdateMarketplacePreferences).toHaveBeenCalledWith('token-123', [
      'ebay',
      'depop',
      'mercari',
    ]);
  });

  it('saves storefront profile changes', async () => {
    const { result } = renderHook(() => useSettingsOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateStorefrontField('title', 'Updated Store');
    });

    mockedUpsertStorefront.mockResolvedValue({
      data: {
        storefront: {
          ...result.current.storefront,
          title: 'Updated Store',
        },
      },
    });

    await act(async () => {
      await result.current.saveStorefrontDraft();
    });

    expect(mockedUpsertStorefront).toHaveBeenCalledWith(
      'token-123',
      expect.objectContaining({
        storefront: expect.objectContaining({
          title: 'Updated Store',
        }),
      }),
    );
  });

  it('creates, updates, deletes, and reorders storefront pages', async () => {
    const { result } = renderHook(() => useSettingsOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockedCreateStorefrontPage.mockResolvedValue({
      data: {
        page: {
          id: 8,
          title: 'Shipping',
          slug: 'shipping',
          menu_label: 'Shipping',
          body: 'Ships in 1-2 days.',
          position: 2,
          published: true,
          inserted_at: '2026-04-01T00:00:00Z',
          updated_at: '2026-04-01T00:00:00Z',
        },
      },
    });

    await act(async () => {
      await result.current.createPage({
        title: 'Shipping',
        slug: 'shipping',
        menu_label: 'Shipping',
        body: 'Ships in 1-2 days.',
        published: true,
      });
    });

    expect(result.current.storefrontPages).toHaveLength(2);

    mockedUpdateStorefrontPage.mockResolvedValue({
      data: {
        page: {
          ...result.current.storefrontPages[0],
          title: 'About Us',
        },
      },
    });

    await act(async () => {
      await result.current.savePage(7, {
        title: 'About Us',
        slug: 'about',
        menu_label: 'About',
        body: 'Welcome to my store.',
        published: true,
      });
    });

    expect(result.current.storefrontPages[0]?.title).toBe('About Us');

    mockedReorderStorefrontPages.mockResolvedValue({
      data: {
        pages: [
          {
            ...result.current.storefrontPages[1],
            position: 1,
          },
          {
            ...result.current.storefrontPages[0],
            position: 2,
          },
        ],
      },
    });

    await act(async () => {
      await result.current.savePageOrder([8, 7], 8);
    });

    expect(result.current.storefrontPages[0]?.id).toBe(8);

    mockedDeleteStorefrontPage.mockResolvedValue({
      data: {
        deleted: true,
      },
    });

    await act(async () => {
      await result.current.removePage(8);
    });

    expect(result.current.storefrontPages).toHaveLength(1);
  });
});
