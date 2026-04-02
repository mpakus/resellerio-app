import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { TextField } from '@/src/components/ui';

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
});
