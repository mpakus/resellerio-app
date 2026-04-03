import { ApiError, apiRequest, formatApiError } from '@/src/lib/api/client';

describe('api client', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends bearer auth and JSON body', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ data: { ok: true } }),
    } as Response);

    await apiRequest<{ data: { ok: boolean } }>('/health', {
      method: 'POST',
      token: 'mobile-token',
      body: { hello: 'world' },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/health'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mobile-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ hello: 'world' }),
      }),
    );
  });

  it('formats validation field errors first', () => {
    const error = new ApiError('Validation failed', 422, {
      error: {
        code: 'validation_failed',
        detail: 'Validation failed',
        status: 422,
        fields: {
          email: ['has already been taken'],
        },
      },
    });

    expect(formatApiError(error)).toBe('has already been taken');
  });

  it('formats limit exceeded responses with used and limit counts', () => {
    const error = new ApiError('Monthly limit reached: 10/10 used.', 402, {
      error: 'limit_exceeded',
      used: 10,
      limit: 10,
      operation: 'lifestyle',
      upgrade_url: 'https://resellerio.com/pricing',
    });

    expect(formatApiError(error)).toBe('Monthly limit reached: 10/10 used.');
  });

  it('does not crash on non-JSON error responses', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => '<html>Bad gateway</html>',
    } as Response);

    await expect(apiRequest('/health')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Request failed.',
      status: 502,
    });
  });

  it('fails safely when a success response is not valid JSON', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'not-json',
    } as Response);

    await expect(apiRequest('/health')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid server response.',
      status: 200,
    });
  });
});
