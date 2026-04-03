import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Linking, Share } from 'react-native';

import SettingsScreen from '@/app/(app)/(tabs)/settings';
import { useSettingsOverview } from '@/src/features/settings/use-settings-overview';
import { useTransfersOverview } from '@/src/features/transfers/use-transfers-overview';
import { useAuth } from '@/src/lib/auth/auth-provider';

jest.mock('@/src/lib/auth/auth-provider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/src/features/settings/use-settings-overview', () => ({
  useSettingsOverview: jest.fn(),
}));

jest.mock('@/src/features/transfers/use-transfers-overview', () => ({
  useTransfersOverview: jest.fn(),
}));

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseSettingsOverview = jest.mocked(useSettingsOverview);
const mockedUseTransfersOverview = jest.mocked(useTransfersOverview);
const mockedOpenURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
const mockedShare = jest.spyOn(Share, 'share').mockResolvedValue({
  action: Share.sharedAction,
  activityType: undefined,
});
const mockSaveMarketplaceDraft = jest.fn();
const mockUploadStorefrontAsset = jest.fn();
const mockRemoveAsset = jest.fn();
const mockRemovePage = jest.fn();
const mockSavePageOrder = jest.fn();
const mockStartExport = jest.fn();
const mockStartImport = jest.fn();

function buildSettingsOverviewMock(overrides: Record<string, unknown> = {}) {
  return {
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
    themes: [
      {
        id: 'desert-clay',
        label: 'Desert Clay',
        colors: {
          page_background: '#f6ecdc',
          surface_background: '#fff9f0',
          text: '#34261b',
          border: '#d8c6ae',
          secondary_accent: '#dcb98d',
          hero_overlay: '#f0d7b1',
          primary_button: '#8a4b22',
        },
      },
      {
        id: 'linen-ink',
        label: 'Linen Ink',
        colors: {
          page_background: '#f7f2e9',
          surface_background: '#fffaf4',
          text: '#1f1f1d',
          border: '#d1c7b9',
          secondary_accent: '#cdbda3',
          hero_overlay: '#ece2d1',
          primary_button: '#333333',
        },
      },
      {
        id: 'forest-study',
        label: 'Forest Study',
        colors: {
          page_background: '#edf2ea',
          surface_background: '#f8fbf7',
          text: '#213126',
          border: '#bfcfbe',
          secondary_accent: '#b5ccb5',
          hero_overlay: '#dbe8d7',
          primary_button: '#39543d',
        },
      },
    ],
    logoAsset: null,
    headerAsset: null,
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
    uploadingAssetKind: null,
    deletingAssetKind: null,
    deletingPageId: null,
    reorderingPageId: null,
    error: null,
    marketplaceError: null,
    storefrontError: null,
    brandingError: null,
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
    uploadStorefrontAsset: mockUploadStorefrontAsset,
    removeAsset: mockRemoveAsset.mockResolvedValue(true),
    createPage: jest.fn().mockResolvedValue(true),
    savePage: jest.fn().mockResolvedValue(true),
    removePage: mockRemovePage.mockResolvedValue(true),
    savePageOrder: mockSavePageOrder.mockResolvedValue(true),
    ...overrides,
  };
}

describe('SettingsScreen', () => {
  beforeEach(() => {
    mockSaveMarketplaceDraft.mockReset();
    mockUploadStorefrontAsset.mockReset();
    mockRemoveAsset.mockReset();
    mockRemovePage.mockReset();
    mockSavePageOrder.mockReset();
    mockStartExport.mockReset();
    mockStartImport.mockReset();
    mockedOpenURL.mockReset();
    mockedShare.mockClear();

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

    mockedUseSettingsOverview.mockReturnValue(buildSettingsOverviewMock());

    mockedUseTransfersOverview.mockReturnValue({
      recentExports: [
        {
          id: 11,
          name: 'Catalog export',
          file_name: 'catalog.zip',
          filter_params: {},
          product_count: 12,
          status: 'completed',
          storage_key: 'users/1/exports/11/catalog.zip',
          download_url: 'https://cdn.example.test/catalog.zip',
          requested_at: '2026-04-02T00:00:00Z',
          completed_at: '2026-04-02T00:02:00Z',
          expires_at: '2026-04-09T00:02:00Z',
          error_message: null,
          inserted_at: '2026-04-02T00:00:00Z',
          updated_at: '2026-04-02T00:02:00Z',
        },
      ],
      recentImports: [
        {
          id: 21,
          status: 'completed',
          source_filename: 'catalog.zip',
          source_storage_key: 'users/1/imports/21/source.zip',
          requested_at: '2026-04-02T00:00:00Z',
          started_at: '2026-04-02T00:01:00Z',
          finished_at: '2026-04-02T00:04:00Z',
          total_products: 12,
          imported_products: 11,
          failed_products: 1,
          error_message: null,
          failure_details: {
            items: [],
          },
          payload: {},
          inserted_at: '2026-04-02T00:00:00Z',
          updated_at: '2026-04-02T00:04:00Z',
        },
      ],
      exportNameDraft: '',
      isLoading: false,
      isRefreshing: false,
      isCreatingExport: false,
      isImporting: false,
      isPolling: false,
      error: null,
      exportError: null,
      importError: null,
      refresh: jest.fn(),
      setExportNameDraft: jest.fn(),
      startExport: mockStartExport,
      startImport: mockStartImport,
    });
  });

  it('renders settings data and storefront pages', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Account and storefront')).toBeTruthy();
    expect(screen.getByText('seller@reseller.local')).toBeTruthy();
    expect(screen.getByDisplayValue('My Store')).toBeTruthy();
    expect(screen.getByText('About · Published')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.queryByText('Seller-facing storefront settings')).toBeNull();
    expect(screen.queryByText('Save slug, title, tagline, description, theme, and enabled state with the mobile storefront API.')).toBeNull();
  });

  it('saves marketplace preferences from the action button', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getAllByText('Save')[0]);

    expect(mockSaveMarketplaceDraft).toHaveBeenCalled();
  });

  it('opens the create page modal on demand', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText('Create page'));

    expect(screen.getByText('Create storefront page')).toBeTruthy();
  });

  it('starts storefront logo upload from the branding section', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByLabelText('Upload logo'));

    expect(mockUploadStorefrontAsset).toHaveBeenCalledWith('logo');
  });

  it('opens pricing and billing links', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText('View plans'));
    fireEvent.press(screen.getByText('Manage billing'));

    expect(mockedOpenURL).toHaveBeenCalledWith('https://resellerio.com/pricing');
    expect(mockedOpenURL).toHaveBeenCalledWith('https://app.lemonsqueezy.com/billing');
  });

  it('opens and shares the public storefront URL', () => {
    render(<SettingsScreen />);

    expect(screen.getAllByText('http://localhost:4000/store/my-store')).toHaveLength(1);
    fireEvent.press(screen.getByText('http://localhost:4000/store/my-store'));
    fireEvent.press(screen.getByText('Open storefront'));
    fireEvent.press(screen.getByText('Share storefront'));

    expect(mockedOpenURL).toHaveBeenCalledWith('http://localhost:4000/store/my-store');
    expect(mockedShare).toHaveBeenCalledWith({
      message: 'http://localhost:4000/store/my-store',
      url: 'http://localhost:4000/store/my-store',
    });
  });

  it('starts exports and opens finished export downloads', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText('Start catalog export'));
    fireEvent.press(screen.getByText('Open export download'));

    expect(mockStartExport).toHaveBeenCalled();
    expect(mockedOpenURL).toHaveBeenCalledWith('https://cdn.example.test/catalog.zip');
  });

  it('starts import flow from the transfers section', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText('Import ZIP archive'));

    expect(mockStartImport).toHaveBeenCalled();
  });

  it('renders storefront asset previews and shorter replace/remove labels', () => {
    mockedUseSettingsOverview.mockReturnValue(buildSettingsOverviewMock({
      logoAsset: {
        id: 10,
        kind: 'logo',
        storage_key: 'users/1/storefronts/3/logo.png',
        url: 'https://cdn.example.test/storefront/logo.png',
        content_type: 'image/png',
        original_filename: 'logo.png',
        width: 400,
        height: 400,
        byte_size: 4000,
        inserted_at: '2026-04-01T00:00:00Z',
        updated_at: '2026-04-01T00:00:00Z',
      },
      headerAsset: {
        id: 11,
        kind: 'header',
        storage_key: 'users/1/storefronts/3/header.png',
        url: 'https://cdn.example.test/storefront/header.png',
        content_type: 'image/png',
        original_filename: 'header.png',
        width: 1600,
        height: 600,
        byte_size: 8000,
        inserted_at: '2026-04-01T00:00:00Z',
        updated_at: '2026-04-01T00:00:00Z',
      },
    }));

    render(<SettingsScreen />);

    expect(screen.getByLabelText('Logo preview')).toBeTruthy();
    expect(screen.getByLabelText('Header preview')).toBeTruthy();
    expect(screen.getByLabelText('Replace logo')).toBeTruthy();
    expect(screen.getByLabelText('Remove logo')).toBeTruthy();
    expect(screen.getByLabelText('Replace header')).toBeTruthy();
    expect(screen.getByLabelText('Remove header')).toBeTruthy();
    expect(screen.queryByText('logo.png · 400x200')).toBeNull();
  });

  it('uses icon branding actions for replace and remove', () => {
    mockedUseSettingsOverview.mockReturnValue(buildSettingsOverviewMock({
      logoAsset: {
        id: 10,
        kind: 'logo',
        storage_key: 'users/1/storefronts/3/logo.png',
        url: 'https://cdn.example.test/storefront/logo.png',
        content_type: 'image/png',
        original_filename: 'logo.png',
        width: 400,
        height: 400,
        byte_size: 4000,
        inserted_at: '2026-04-01T00:00:00Z',
        updated_at: '2026-04-01T00:00:00Z',
      },
    }));

    render(<SettingsScreen />);

    fireEvent.press(screen.getByLabelText('Replace logo'));
    fireEvent.press(screen.getByLabelText('Remove logo'));

    expect(mockUploadStorefrontAsset).toHaveBeenCalledWith('logo');
    expect(mockRemoveAsset).toHaveBeenCalledWith('logo');
  });

  it('uses icon actions for page edit, reorder, and delete with confirmation', async () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByLabelText('Edit page About'));
    expect(screen.getByText('Edit About')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Move page About down'));
    expect(mockSavePageOrder).not.toHaveBeenCalled();

    fireEvent.press(screen.getByLabelText('Delete page About'));
    expect(screen.getByText('Delete About?')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText('Delete'));
    });

    expect(mockRemovePage).toHaveBeenCalledWith(7);
  });

  it('renders theme cards and expands the theme list on demand', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Selected theme')).toBeTruthy();
    expect(screen.getAllByText('Desert Clay').length).toBeGreaterThan(0);
    expect(screen.getByText('Linen Ink')).toBeTruthy();
    expect(screen.queryByText('Forest Study')).toBeNull();

    fireEvent.press(screen.getByText('Show all 3 themes'));

    expect(screen.getByText('Forest Study')).toBeTruthy();
  });
});
