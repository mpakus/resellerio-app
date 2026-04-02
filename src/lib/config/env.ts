import { Platform } from 'react-native';

const productionApiBaseUrl = 'https://resellerio.com/api/v1';

function normalizeBaseUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  return value.trim().replace(/\/+$/, '');
}

function localApiBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api/v1';
  }

  return 'http://localhost:4000/api/v1';
}

export const apiBaseUrl =
  normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL) ??
  (__DEV__ ? localApiBaseUrl() : productionApiBaseUrl);

export const appBaseUrl = apiBaseUrl.replace(/\/api\/v1$/, '');
