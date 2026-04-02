import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { IntroSplash } from '@/src/components/intro-splash';
import { AuthProvider } from '@/src/lib/auth/auth-provider';
import { colors } from '@/src/theme/colors';

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [showIntroSplash, setShowIntroSplash] = useState(true);

  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider
          value={{
            ...DefaultTheme,
            colors: {
              ...DefaultTheme.colors,
              background: colors.background,
              card: colors.card,
              text: colors.text,
              border: colors.border,
              primary: colors.accent,
            },
          }}
        >
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="sign-in" />
              <Stack.Screen name="sign-up" />
              <Stack.Screen name="(app)" />
            </Stack>
            {showIntroSplash ? (
              <IntroSplash
                onFinish={() => {
                  setShowIntroSplash(false);
                }}
              />
            ) : null}
          </View>
          <StatusBar style="dark" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
