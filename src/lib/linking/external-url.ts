import { Linking, Share } from 'react-native';

function isPrivateDevelopmentHost(hostname: string) {
  const normalized = hostname.trim().toLowerCase();

  if (
    normalized === 'localhost' ||
    normalized === '::1' ||
    normalized.endsWith('.local') ||
    /^127\./.test(normalized) ||
    /^10\./.test(normalized) ||
    /^192\.168\./.test(normalized)
  ) {
    return true;
  }

  const match = normalized.match(/^172\.(\d{1,3})\./);

  if (!match) {
    return false;
  }

  const secondOctet = Number(match[1]);
  return secondOctet >= 16 && secondOctet <= 31;
}

export function sanitizeExternalUrl(value: string | null | undefined) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const parsed = new URL(trimmedValue);
    const protocol = parsed.protocol.toLowerCase();

    // Never allow externally opened URLs to embed credentials.
    if (parsed.username || parsed.password) {
      return null;
    }

    if (protocol === 'https:') {
      return parsed.toString();
    }

    if (protocol === 'http:' && isPrivateDevelopmentHost(parsed.hostname)) {
      return parsed.toString();
    }

    return null;
  } catch {
    return null;
  }
}

export function isSafeExternalUrl(value: string | null | undefined) {
  return sanitizeExternalUrl(value) !== null;
}

export async function openExternalUrlSafely(value: string | null | undefined) {
  const safeUrl = sanitizeExternalUrl(value);

  if (!safeUrl) {
    return false;
  }

  await Linking.openURL(safeUrl);
  return true;
}

export async function shareExternalUrlSafely(value: string | null | undefined) {
  const safeUrl = sanitizeExternalUrl(value);

  if (!safeUrl) {
    return false;
  }

  await Share.share({
    message: safeUrl,
    url: safeUrl,
  });
  return true;
}
