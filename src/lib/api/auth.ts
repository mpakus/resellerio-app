import { Platform } from 'react-native';

import { apiRequest } from '@/src/lib/api/client';
import type { AuthResponse, MeResponse, UsageResponse } from '@/src/lib/api/types';

type AuthCredentials = {
  email: string;
  password: string;
};

function deviceName() {
  return Platform.select({
    ios: 'ResellerIO iPhone',
    android: 'ResellerIO Android',
    default: 'ResellerIO Device',
  });
}

export function login(credentials: AuthCredentials) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: {
      email: credentials.email.trim(),
      password: credentials.password,
      device_name: deviceName(),
    },
  });
}

export function register(credentials: AuthCredentials) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: {
      email: credentials.email.trim(),
      password: credentials.password,
      device_name: deviceName(),
    },
  });
}

export function getCurrentUser(token: string) {
  return apiRequest<MeResponse>('/me', { token });
}

export function getCurrentUsage(token: string) {
  return apiRequest<UsageResponse>('/me/usage', { token });
}
