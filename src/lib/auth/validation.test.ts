import {
  REGISTRATION_PASSWORD_MAX_LENGTH,
  REGISTRATION_PASSWORD_MIN_LENGTH,
  validateRegistrationCredentials,
} from '@/src/lib/auth/validation';

describe('validateRegistrationCredentials', () => {
  it('requires an email address', () => {
    expect(validateRegistrationCredentials('', 'very-secure-password')).toBe('Email is required.');
  });

  it('requires a password', () => {
    expect(validateRegistrationCredentials('seller@example.com', '')).toBe('Password is required.');
  });

  it('rejects passwords shorter than the API minimum', () => {
    expect(validateRegistrationCredentials('seller@example.com', 'short-pass')).toBe(
      `Password must be at least ${REGISTRATION_PASSWORD_MIN_LENGTH} characters.`,
    );
  });

  it('rejects passwords longer than the API maximum', () => {
    expect(
      validateRegistrationCredentials(
        'seller@example.com',
        'x'.repeat(REGISTRATION_PASSWORD_MAX_LENGTH + 1),
      ),
    ).toBe(`Password must be at most ${REGISTRATION_PASSWORD_MAX_LENGTH} characters.`);
  });

  it('accepts valid registration credentials', () => {
    expect(validateRegistrationCredentials('seller@example.com', 'very-secure-password')).toBeNull();
  });
});
