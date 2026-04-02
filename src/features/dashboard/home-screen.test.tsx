import { fireEvent, render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/(app)/(tabs)/home';
import { useDashboardOverview } from '@/src/features/dashboard/use-dashboard-overview';
import { useAuth } from '@/src/lib/auth/auth-provider';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/src/lib/auth/auth-provider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/src/features/dashboard/use-dashboard-overview', () => ({
  useDashboardOverview: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseDashboardOverview = jest.mocked(useDashboardOverview);

describe('HomeScreen', () => {
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
          plan: 'starter',
          plan_status: 'active',
          plan_period: 'monthly',
          plan_expires_at: null,
          trial_ends_at: null,
          addon_credits: {},
        },
        supportedMarketplaces: [],
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
      },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });

    mockedUseDashboardOverview.mockReturnValue({
      totalProducts: 14,
      readyProducts: 8,
      processingProducts: 3,
      inquiries: 5,
      trackedExports: 2,
      trackedImports: 1,
      recentProducts: [
        {
          id: 11,
          status: 'ready',
          title: 'Nike Air Max 90',
          brand: 'Nike',
          category: 'Sneakers',
          price: '84.00',
          updated_at: '2026-04-02T00:00:00Z',
          product_tab: null,
        },
      ],
      isLoading: false,
      isRefreshing: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it('renders dashboard stats and recent activity', () => {
    render(<HomeScreen />);

    expect(screen.getByText('DASHBOARD')).toBeTruthy();
    expect(screen.getByText('seller@reseller.local')).toBeTruthy();
    expect(screen.getByText('14')).toBeTruthy();
    expect(screen.getByText('Nike Air Max 90')).toBeTruthy();
    expect(screen.getByText('2 tracked exports · 1 tracked imports')).toBeTruthy();
  });

  it('renders quick action buttons', () => {
    render(<HomeScreen />);

    fireEvent.press(screen.getByText('+ Add product'));
    fireEvent.press(screen.getByText('Open products'));
    fireEvent.press(screen.getByText('Open inquiries'));
    fireEvent.press(screen.getByText('Open transfers and settings'));

    expect(screen.getByText('Jump into the next workflow')).toBeTruthy();
  });
});
