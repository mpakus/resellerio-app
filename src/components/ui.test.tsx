import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { BrandedTitle, LinkText, TextField } from '@/src/components/ui';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

const mockedSetStringAsync = jest.mocked(Clipboard.setStringAsync);

describe('TextField copy action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSetStringAsync.mockResolvedValue(true);
  });

  it('copies the current input value to the clipboard', async () => {
    render(<TextField label="Title" copyable value="Nike Air Max 90" onChangeText={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Copy Title'));

    await waitFor(() => {
      expect(mockedSetStringAsync).toHaveBeenCalledWith('Nike Air Max 90');
    });
  });

  it('does not copy empty values', () => {
    render(<TextField label="Notes" copyable value="" onChangeText={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Copy Notes'));

    expect(mockedSetStringAsync).not.toHaveBeenCalled();
  });

  it('renders the inline ResellerIO logo next to a page title', () => {
    render(<BrandedTitle title="Products workspace" />);

    expect(screen.getByLabelText('ResellerIO logo')).toBeTruthy();
    expect(screen.getByText('Products workspace')).toBeTruthy();
  });

  it('triggers the browser-style link action when tapped', () => {
    const onPress = jest.fn();

    render(<LinkText label="http://localhost:4000/store/my-store" onPress={onPress} />);

    fireEvent.press(screen.getByText('http://localhost:4000/store/my-store'));

    expect(onPress).toHaveBeenCalled();
  });
});
