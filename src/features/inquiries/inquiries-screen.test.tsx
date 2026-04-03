import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import InquiriesScreen from '@/app/(app)/(tabs)/inquiries';
import { formatInquiryTimestamp } from '@/src/features/inquiries/helpers';
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

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseInquiriesOverview = jest.mocked(useInquiriesOverview);

const mockSubmitSearch = jest.fn();
const mockRemoveInquiry = jest.fn();

describe('InquiriesScreen', () => {
  beforeEach(() => {
    mockSubmitSearch.mockReset();
    mockRemoveInquiry.mockReset();

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
      removeInquiry: mockRemoveInquiry.mockResolvedValue(true),
    });
  });

  it('renders compact inquiry rows with name, contact, and received time', () => {
    render(<InquiriesScreen />);

    expect(screen.getByText('Inquiry inbox')).toBeTruthy();
    expect(screen.getByText('Jane Buyer')).toBeTruthy();
    expect(screen.getByText('jane@example.com')).toBeTruthy();
    expect(screen.getByText(formatInquiryTimestamp('2026-04-02T10:00:00Z'))).toBeTruthy();
    expect(screen.queryByText('Is this still available?')).toBeNull();
    expect(screen.queryByText('Delete')).toBeNull();
  });

  it('submits search from the action button', () => {
    render(<InquiriesScreen />);

    fireEvent.press(screen.getByText('Search'));

    expect(mockSubmitSearch).toHaveBeenCalled();
  });

  it('opens an inquiry detail dialog with the requested actions only', () => {
    render(<InquiriesScreen />);

    fireEvent.press(screen.getByLabelText('Open inquiry from Jane Buyer'));

    expect(screen.getByText('Is this still available?')).toBeTruthy();
    expect(screen.getByLabelText('Open Product')).toBeTruthy();
    expect(screen.getByLabelText('Close inquiry actions')).toBeTruthy();
    expect(screen.getByLabelText('Delete inquiry')).toBeTruthy();
    expect(screen.getByLabelText('Close inquiry')).toBeTruthy();
    expect(screen.queryByText('/store/my-store/products/1-vintage-jacket')).toBeNull();
  });

  it('closes the inquiry detail dialog from the icon action', () => {
    render(<InquiriesScreen />);

    fireEvent.press(screen.getByLabelText('Open inquiry from Jane Buyer'));
    fireEvent.press(screen.getByLabelText('Close inquiry actions'));

    expect(screen.queryByText('Is this still available?')).toBeNull();
  });

  it('closes the inquiry detail dialog from the top-right close control', () => {
    render(<InquiriesScreen />);

    fireEvent.press(screen.getByLabelText('Open inquiry from Jane Buyer'));
    fireEvent.press(screen.getByLabelText('Close inquiry'));

    expect(screen.queryByText('Is this still available?')).toBeNull();
  });

  it('asks for confirmation before deleting the selected inquiry', () => {
    render(<InquiriesScreen />);

    fireEvent.press(screen.getByLabelText('Open inquiry from Jane Buyer'));
    fireEvent.press(screen.getByLabelText('Delete inquiry'));

    expect(screen.getByText('Delete this inquiry?')).toBeTruthy();
    expect(mockRemoveInquiry).not.toHaveBeenCalled();
  });

  it('closes the delete confirmation without removing the inquiry', () => {
    render(<InquiriesScreen />);

    fireEvent.press(screen.getByLabelText('Open inquiry from Jane Buyer'));
    fireEvent.press(screen.getByLabelText('Delete inquiry'));
    fireEvent.press(screen.getByText('Cancel'));

    expect(screen.queryByText('Delete this inquiry?')).toBeNull();
    expect(mockRemoveInquiry).not.toHaveBeenCalled();
  });

  it('deletes the selected inquiry after confirmation', async () => {
    render(<InquiriesScreen />);

    fireEvent.press(screen.getByLabelText('Open inquiry from Jane Buyer'));
    fireEvent.press(screen.getByLabelText('Delete inquiry'));
    fireEvent.press(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockRemoveInquiry).toHaveBeenCalledWith(7);
    });
  });
});
