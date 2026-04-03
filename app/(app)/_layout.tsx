import { Redirect, Stack } from 'expo-router';

import { LoadingScreen } from '@/src/components/ui';
import { useAuth } from '@/src/lib/auth/auth-provider';

export default function AppLayout() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen label="Loading workspace..." />;
  }

  if (status !== 'authenticated') {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="products/new"
        options={{ title: 'New Product', headerShadowVisible: false, headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="products/[id]"
        options={{ title: 'Product', headerShadowVisible: false, headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}
