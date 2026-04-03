import { apiBaseUrl } from '@/src/lib/config/env';
import type { ApiErrorPayload } from '@/src/lib/api/types';

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  token?: string;
  body?: unknown;
};

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(message: string, status: number, payload: ApiErrorPayload | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const payload = parseJsonResponse<T & ApiErrorPayload>(text);

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(payload), response.status, payload);
  }

  if (text && payload === null) {
    throw new ApiError('Invalid server response.', response.status, null);
  }

  return payload as T;
}

export function formatApiError(error: unknown) {
  if (error instanceof ApiError) {
    const fieldMessage = extractFieldMessage(error.payload);

    if (fieldMessage) {
      return fieldMessage;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

function extractErrorMessage(payload: ApiErrorPayload | null) {
  if (!payload) {
    return 'Request failed.';
  }

  if (typeof payload.error === 'string') {
    if (payload.error === 'limit_exceeded' && 'limit' in payload && 'used' in payload) {
      return `Monthly limit reached: ${payload.used}/${payload.limit} used.`;
    }

    return payload.error;
  }

  return payload.error?.detail ?? 'Request failed.';
}

function extractFieldMessage(payload: ApiErrorPayload | null) {
  if (!payload || typeof payload.error === 'string') {
    return null;
  }

  const fields = payload.error?.fields;

  if (!fields) {
    return null;
  }

  const firstField = Object.values(fields)[0];

  if (!firstField || firstField.length === 0) {
    return null;
  }

  return firstField.join(', ');
}

function parseJsonResponse<T>(text: string) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
