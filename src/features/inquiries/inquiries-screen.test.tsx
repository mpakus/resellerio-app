import { fireEvent, render, screen } from '@testing-library/react-native';

import InquiriesScreen from '@/app/(app)/(tabs)/inquiries';
import { useInquiriesOverview } from '@/src/features/inquiries/use-inquiries-overview';
import { useAuth } from '@/src/lib/auth/auth-provider';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/src/lib/auth/auth-provider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/src/features/inquiries/use-inquiries-overview', () => ({
  useInquiriesOverview: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseInquiriesOverview = jest.mocked(useInquiriesOverview);

const mockSubmitSearch = jest.fn();

describe('InquiriesScreen', () => {
  beforeEach(() => {
    mockSubmitSearch.mockReset();

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

    mockedUseInquiriesOverview.mockReturnValue({
      inquiries: [
        {
          id: 7,
          full_name: 'Jane Buyer',
          contact: 'jane@example.com',
          message: 'Is this still available?',
          source_path: '/store/my-store/products/1-vintage-jacket',
          product_id: 12,
          inserted_at: '2026-04-02T10:00:00Z',
        },
      ],
      filters: {
        query: '',
        page: 1,
      },
      searchDraft: '',
      setSearchDraft: jest.fn(),
      pagination: {
        page: 1,
        page_size: 20,
        total_count: 1,
        total_pages: 1,
      },
      isLoading: false,
      isRefreshing: false,
      deletingInquiryId: null,
      error: null,
      refresh: jest.fn(),
      submitSearch: mockSubmitSearch,
      clearSearch: jest.fn(),
      loadNextPage: jest.fn(),
      removeInquiry: jest.fn().mockResolvedValue(true),
    });
  });

  it('renders inquiry data and exposes the product quick action', () => {
    render(<InquiriesScreen />);

    expect(screen.getByText('Inquiry inbox')).toBeTruthy();
    expect(screen.getByText('Jane Buyer')).toBeTruthy();
    expect(screen.getByText('Is this still available?')).toBeTruthy();
    expect(screen.getByText('Open product')).toBeTruthy();
  });

  it('submits search from the action button', () => {
    render(<InquiriesScreen />);

    fireEvent.press(screen.getByText('Search'));

    expect(mockSubmitSearch).toHaveBeenCalled();
  });
});
