import { Linking, Share } from 'react-native';

import {
  isSafeExternalUrl,
  openExternalUrlSafely,
  sanitizeExternalUrl,
  shareExternalUrlSafely,
} from '@/src/lib/linking/external-url';

describe('external URL helpers', () => {
  const mockedOpenURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  const mockedShare = jest.spyOn(Share, 'share').mockResolvedValue({
    action: Share.sharedAction,
    activityType: undefined,
  });

  beforeEach(() => {
    mockedOpenURL.mockClear();
    mockedShare.mockClear();
  });

  it('allows https URLs and local development http URLs', () => {
    expect(sanitizeExternalUrl('https://resellerio.com/store/my-store')).toBe(
      'https://resellerio.com/store/my-store',
    );
    expect(sanitizeExternalUrl('http://localhost:4000/store/my-store')).toBe(
      'http://localhost:4000/store/my-store',
    );
    expect(sanitizeExternalUrl('http://10.0.2.2:4000/docs/api')).toBe(
      'http://10.0.2.2:4000/docs/api',
    );
  });

  it('rejects unsafe or unsupported URL schemes', () => {
    expect(sanitizeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeExternalUrl('data:text/html,boom')).toBeNull();
    expect(sanitizeExternalUrl('http://example.com')).toBeNull();
    expect(isSafeExternalUrl('ftp://example.com/file.txt')).toBe(false);
  });

  it('opens only safe URLs', async () => {
    await expect(openExternalUrlSafely('https://resellerio.com')).resolves.toBe(true);
    await expect(openExternalUrlSafely('javascript:alert(1)')).resolves.toBe(false);

    expect(mockedOpenURL).toHaveBeenCalledTimes(1);
    expect(mockedOpenURL).toHaveBeenCalledWith('https://resellerio.com/');
  });

  it('shares only safe URLs', async () => {
    await expect(shareExternalUrlSafely('https://resellerio.com/store/my-store')).resolves.toBe(true);
    await expect(shareExternalUrlSafely('http://example.com/unsafe')).resolves.toBe(false);

    expect(mockedShare).toHaveBeenCalledTimes(1);
    expect(mockedShare).toHaveBeenCalledWith({
      message: 'https://resellerio.com/store/my-store',
      url: 'https://resellerio.com/store/my-store',
    });
  });
});
