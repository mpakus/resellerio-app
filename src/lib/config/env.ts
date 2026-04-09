import Constants from 'expo-constants';
import { Platform } from 'react-native';

const productionApiBaseUrl = 'https://resellerio.com/api/v1';

function normalizeBaseUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  return value.trim().replace(/\/+$/, '');
}

function extractHost(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const withoutProtocol = trimmedValue.replace(/^[a-z]+:\/\//i, '');
  const withoutPath = withoutProtocol.split('/')[0] ?? withoutProtocol;
  const host = withoutPath.split(':')[0]?.trim();

  return host || null;
}

function isLocalDevelopmentHost(host: string) {
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return true;
  }

  if (host.endsWith('.local')) {
    return true;
  }

  if (/^10\.\d+\.\d+\.\d+$/.test(host)) {
    return true;
  }

  if (/^192\.168\.\d+\.\d+$/.test(host)) {
    return true;
  }

  const match = host.match(/^172\.(\d+)\.\d+\.\d+$/);

  if (!match) {
    return false;
  }

  const secondOctet = Number(match[1]);
  return secondOctet >= 16 && secondOctet <= 31;
}

function expoPackagerHost() {
  const expoGoConfig = Constants.expoGoConfig as { debuggerHost?: string | null } | null;
  const candidates = [
    extractHost(Constants.expoConfig?.hostUri),
    extractHost(expoGoConfig?.debuggerHost),
    extractHost(Constants.linkingUri),
  ];

  for (const candidate of candidates) {
    if (candidate && isLocalDevelopmentHost(candidate) && candidate !== 'localhost') {
      return candidate;
    }
  }

  return null;
}

export function resolveApiBaseUrl({
  explicitBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL,
  isDev = __DEV__,
  platform = Platform.OS,
  detectedExpoHost = expoPackagerHost(),
}: {
  explicitBaseUrl?: string;
  isDev?: boolean;
  platform?: string;
  detectedExpoHost?: string | null;
} = {}) {
  const normalizedExplicitBaseUrl = normalizeBaseUrl(explicitBaseUrl);

  if (normalizedExplicitBaseUrl) {
    return normalizedExplicitBaseUrl;
  }

  if (!isDev) {
    return productionApiBaseUrl;
  }

  if (detectedExpoHost) {
    return `http://${detectedExpoHost}:4000/api/v1`;
  }

  if (platform === 'android') {
    return 'http://10.0.2.2:4000/api/v1';
  }

  return 'http://localhost:4000/api/v1';
}

export const apiBaseUrl = resolveApiBaseUrl();

export const appBaseUrl = apiBaseUrl.replace(/\/api\/v1$/, '');
