import * as SecureStore from 'expo-secure-store';

async function canUseSecureStore() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

function webSessionStorage() {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage;
  }

  return null;
}

export async function getSecureItem(key: string) {
  if (await canUseSecureStore()) {
    return SecureStore.getItemAsync(key);
  }

  const storage = webSessionStorage();

  if (storage) {
    return storage.getItem(key);
  }

  return null;
}

export async function setSecureItem(key: string, value: string) {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  const storage = webSessionStorage();

  if (storage) {
    storage.setItem(key, value);
  }
}

export async function deleteSecureItem(key: string) {
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  const storage = webSessionStorage();

  if (storage) {
    storage.removeItem(key);
  }
}
