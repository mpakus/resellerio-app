export const REGISTRATION_PASSWORD_MIN_LENGTH = 12;
export const REGISTRATION_PASSWORD_MAX_LENGTH = 72;

export function validateRegistrationCredentials(email: string, password: string) {
  if (email.trim().length === 0) {
    return 'Email is required.';
  }

  const trimmedPassword = password.trim();

  if (trimmedPassword.length === 0) {
    return 'Password is required.';
  }

  if (trimmedPassword.length < REGISTRATION_PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${REGISTRATION_PASSWORD_MIN_LENGTH} characters.`;
  }

  if (trimmedPassword.length > REGISTRATION_PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${REGISTRATION_PASSWORD_MAX_LENGTH} characters.`;
  }

  return null;
}
