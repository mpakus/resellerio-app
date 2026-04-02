import { fireEvent, render, screen } from '@testing-library/react-native';

import SettingsScreen from '@/app/(app)/(tabs)/settings';
import { useSettingsOverview } from '@/src/features/settings/use-settings-overview';
import { useAuth } from '@/src/lib/auth/auth-provider';

jest.mock('@/src/lib/auth/auth-provider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/src/features/settings/use-settings-overview', () => ({
  useSettingsOverview: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseSettingsOverview = jest.mocked(useSettingsOverview);
const mockSaveMarketplaceDraft = jest.fn();

describe('SettingsScreen', () => {
  beforeEach(() => {
    mockSaveMarketplaceDraft.mockReset();

    mockedUseAuth.mockReturnValue({
      status: 'authenticated',
      session: {
        token: 'token-123',
        expiresAt: null,
        user: {
          id: 1,
          email: 'seller@reseller.local',
          confirmed_at: null,
          selected_marketplaces: ['ebay'],
          plan: 'starter',
          plan_status: 'active',
          plan_period: 'monthly',
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

    mockedUseSettingsOverview.mockReturnValue({
      user: {
        id: 1,
        email: 'seller@reseller.local',
        confirmed_at: null,
        selected_marketplaces: ['ebay'],
        plan: 'starter',
        plan_status: 'active',
        plan_period: 'monthly',
        plan_expires_at: null,
        trial_ends_at: null,
        addon_credits: {},
      },
      supportedMarketplaces: [
        { id: 'ebay', label: 'eBay' },
        { id: 'mercari', label: 'Mercari' },
      ],
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
      storefrontPages: [
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
      selectedMarketplacesDraft: ['ebay'],
      storefrontDraft: {
        slug: 'my-store',
        title: 'My Store',
        tagline: 'Curated resale.',
        description: 'Secondhand fashion with fast shipping.',
        theme_id: 'neutral-warm',
        enabled: true,
      },
      isLoading: false,
      isRefreshing: false,
      isSavingMarketplaces: false,
      isSavingStorefront: false,
      isSavingPage: false,
      deletingPageId: null,
      reorderingPageId: null,
      error: null,
      marketplaceError: null,
      storefrontError: null,
      pageError: null,
      isMarketplacesDirty: true,
      isStorefrontDirty: false,
      refresh: jest.fn(),
      toggleMarketplace: jest.fn(),
      resetMarketplaceDraft: jest.fn(),
      saveMarketplaceDraft: mockSaveMarketplaceDraft,
      updateStorefrontField: jest.fn(),
      resetStorefrontDraft: jest.fn(),
      saveStorefrontDraft: jest.fn(),
      createPage: jest.fn().mockResolvedValue(true),
      savePage: jest.fn().mockResolvedValue(true),
      removePage: jest.fn().mockResolvedValue(true),
      savePageOrder: jest.fn().mockResolvedValue(true),
    });
  });

  it('renders settings data and storefront pages', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Account and storefront')).toBeTruthy();
    expect(screen.getByText('seller@reseller.local')).toBeTruthy();
    expect(screen.getByDisplayValue('My Store')).toBeTruthy();
    expect(screen.getByText('About · Published')).toBeTruthy();
  });

  it('saves marketplace preferences from the action button', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText('Save marketplaces'));

    expect(mockSaveMarketplaceDraft).toHaveBeenCalled();
  });

  it('opens the create page modal on demand', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText('Create page'));

    expect(screen.getByText('Create storefront page')).toBeTruthy();
  });
});
