import { Redirect } from 'expo-router';

import { LoadingScreen } from '@/src/components/ui';
import { useAuth } from '@/src/lib/auth/auth-provider';

export default function IndexScreen() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen label="Restoring your session..." />;
  }

  return <Redirect href={status === 'authenticated' ? '/products' : '/sign-in'} />;
}
