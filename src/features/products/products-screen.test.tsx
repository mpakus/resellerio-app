import { fireEvent, render, screen } from '@testing-library/react-native';

import ProductsScreen from '@/app/(app)/(tabs)/products';
import { useProductsOverview } from '@/src/features/products/use-products-overview';
import { useAuth } from '@/src/lib/auth/auth-provider';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/src/lib/auth/auth-provider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/src/features/products/use-products-overview', () => ({
  useProductsOverview: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseProductsOverview = jest.mocked(useProductsOverview);

describe('ProductsScreen tab dialogs', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      status: 'authenticated',
      session: {
        token: 'token-123',
        expiresAt: null,
        user: {
          id: 1,
          email: 'seller@reseller.local',
          confirmed_at: null,
          selected_marketplaces: [],
          plan: 'free',
          plan_status: 'free',
          plan_period: null,
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

    mockedUseProductsOverview.mockReturnValue({
      products: [],
      productTabs: [
        {
          id: 7,
          name: 'Shoes',
          position: 1,
          inserted_at: '2026-04-01T00:00:00Z',
          updated_at: '2026-04-01T00:00:00Z',
        },
      ],
      filters: { status: 'all', query: '', productTabId: 7, page: 1 },
      searchDraft: '',
      setSearchDraft: jest.fn(),
      pagination: { page: 1, page_size: 15, total_count: 0, total_pages: 1 },
      isLoading: false,
      isRefreshing: false,
      error: null,
      refresh: jest.fn(),
      setStatus: jest.fn(),
      selectProductTab: jest.fn(),
      submitSearch: jest.fn(),
      clearSearch: jest.fn(),
      loadNextPage: jest.fn(),
      tabName: '',
      setTabName: jest.fn(),
      tabError: null,
      isCreatingTab: false,
      addProductTab: jest.fn().mockResolvedValue(undefined),
      editingTabId: null,
      editingTabName: '',
      setEditingTabName: jest.fn(),
      startEditingTab: jest.fn(),
      cancelEditingTab: jest.fn(),
      isUpdatingTab: false,
      saveEditingTab: jest.fn().mockResolvedValue(undefined),
      deletingTabId: null,
      removeProductTab: jest.fn().mockResolvedValue(undefined),
    });
  });

  it('keeps create and manage tab dialogs hidden by default and opens them on demand', () => {
    render(<ProductsScreen />);

    expect(screen.queryByText('Create a tab')).toBeNull();
    expect(screen.queryByText('Manage Shoes')).toBeNull();

    fireEvent.press(screen.getByText('+ Create Tab'));
    expect(screen.getByText('Create a tab')).toBeTruthy();

    fireEvent.press(screen.getByText('Close'));

    fireEvent.press(screen.getByLabelText('Manage Shoes'));
    expect(screen.getByText('Manage Shoes')).toBeTruthy();
  });
});
