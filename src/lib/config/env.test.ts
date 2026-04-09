import { resolveApiBaseUrl } from '@/src/lib/config/env';

describe('resolveApiBaseUrl', () => {
  it('prefers an explicit API base URL override', () => {
    expect(
      resolveApiBaseUrl({
        explicitBaseUrl: ' https://resellerio.com/api/v1/ ',
        isDev: true,
        platform: 'ios',
        detectedExpoHost: '192.168.1.44',
      }),
    ).toBe('https://resellerio.com/api/v1');
  });

  it('uses the detected Expo LAN host for physical-device development', () => {
    expect(
      resolveApiBaseUrl({
        isDev: true,
        platform: 'ios',
        detectedExpoHost: '192.168.1.44',
      }),
    ).toBe('http://192.168.1.44:4000/api/v1');
  });

  it('falls back to the Android emulator loopback host in development', () => {
    expect(
      resolveApiBaseUrl({
        isDev: true,
        platform: 'android',
        detectedExpoHost: null,
      }),
    ).toBe('http://10.0.2.2:4000/api/v1');
  });

  it('falls back to localhost on iOS simulator and web development', () => {
    expect(
      resolveApiBaseUrl({
        isDev: true,
        platform: 'ios',
        detectedExpoHost: null,
      }),
    ).toBe('http://localhost:4000/api/v1');
  });

  it('uses production when not in development', () => {
    expect(
      resolveApiBaseUrl({
        isDev: false,
        platform: 'ios',
        detectedExpoHost: '192.168.1.44',
      }),
    ).toBe('https://resellerio.com/api/v1');
  });
});

describe('apiBaseUrl module detection', () => {
  const originalDev = __DEV__;

  afterEach(() => {
    jest.resetModules();
    jest.dontMock('expo-constants');
    jest.dontMock('react-native');
    (globalThis as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('uses Expo hostUri when the app is running through Expo Go on LAN', () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;

    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: {
        expoConfig: {
          hostUri: '192.168.1.77:8081',
        },
        expoGoConfig: null,
        linkingUri: 'exp://192.168.1.77:8081',
      },
    }));

    jest.doMock('react-native', () => ({
      Platform: {
        OS: 'ios',
      },
    }));

    jest.isolateModules(() => {
      const env = jest.requireActual('@/src/lib/config/env') as typeof import('@/src/lib/config/env');
      expect(env.apiBaseUrl).toBe('http://192.168.1.77:4000/api/v1');
      expect(env.appBaseUrl).toBe('http://192.168.1.77:4000');
    });
  });

  it('ignores public Expo tunnel hosts and falls back to localhost on iOS', () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;

    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: {
        expoConfig: {
          hostUri: 'u.expo.dev',
        },
        expoGoConfig: null,
        linkingUri: 'exp://u.expo.dev',
      },
    }));

    jest.doMock('react-native', () => ({
      Platform: {
        OS: 'ios',
      },
    }));

    jest.isolateModules(() => {
      const env = jest.requireActual('@/src/lib/config/env') as typeof import('@/src/lib/config/env');
      expect(env.apiBaseUrl).toBe('http://localhost:4000/api/v1');
    });
  });
});
