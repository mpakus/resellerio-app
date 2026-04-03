import * as SecureStore from 'expo-secure-store';

import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from '@/src/lib/storage/secure-store';

jest.mock('expo-secure-store', () => ({
  isAvailableAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedSecureStore = jest.mocked(SecureStore);

describe('secure store fallback', () => {
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: sessionStorageMock,
    });
  });

  afterEach(() => {
    delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
  });

  it('uses Expo SecureStore when available', async () => {
    mockedSecureStore.isAvailableAsync.mockResolvedValue(true);
    mockedSecureStore.getItemAsync.mockResolvedValue('token');

    await expect(getSecureItem('session')).resolves.toBe('token');
    await setSecureItem('session', 'token');
    await deleteSecureItem('session');

    expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith('session');
    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('session', 'token');
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('session');
    expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('falls back to sessionStorage when SecureStore is unavailable', async () => {
    mockedSecureStore.isAvailableAsync.mockResolvedValue(false);
    sessionStorageMock.getItem.mockReturnValue('session-token');

    await expect(getSecureItem('session')).resolves.toBe('session-token');
    await setSecureItem('session', 'new-token');
    await deleteSecureItem('session');

    expect(sessionStorageMock.getItem).toHaveBeenCalledWith('session');
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('session', 'new-token');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('session');
    expect(mockedSecureStore.setItemAsync).not.toHaveBeenCalled();
  });
});
