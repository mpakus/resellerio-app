import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import SignUpScreen from '@/app/sign-up';

const mockSignUp = jest.fn();

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  const { Text: MockText } = jest.requireActual('react-native');

  return {
    Link: ({ children }: PropsWithChildren) => React.createElement(MockText, null, children),
    router: {
      replace: jest.fn(),
    },
  };
});

jest.mock('@/src/lib/auth/auth-provider', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
  }),
}));

describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the backend-aligned password requirement', () => {
    render(<SignUpScreen />);

    expect(screen.getByPlaceholderText('At least 12 characters')).toBeTruthy();
    expect(
      screen.getByText('Password must be 12-72 characters to match the current seller API requirements.'),
    ).toBeTruthy();
  });

  it('blocks submit early for passwords shorter than 12 characters', async () => {
    render(<SignUpScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('seller@example.com'), 'seller@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('At least 12 characters'), 'short-pass');
    fireEvent.press(screen.getByText('Create account'));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 12 characters.')).toBeTruthy();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('submits valid registration credentials', async () => {
    mockSignUp.mockResolvedValue(undefined);

    render(<SignUpScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('seller@example.com'), 'seller@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('At least 12 characters'), 'very-secure-password');
    fireEvent.press(screen.getByText('Create account'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'seller@example.com',
        password: 'very-secure-password',
      });
    });
  });
});
