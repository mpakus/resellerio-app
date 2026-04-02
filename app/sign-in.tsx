import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { BrandedTitle, Button, InlineError, Screen, TextField } from '@/src/components/ui';
import { useAuth } from '@/src/lib/auth/auth-provider';
import { formatApiError } from '@/src/lib/api/client';
import { colors } from '@/src/theme/colors';

const TEST_EMAIL = 'seller@reseller.local';
const TEST_PASSWORD = 'very-secure-password';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      await signIn({ email, password });
      router.replace('/products');
    } catch (submitError) {
      setError(formatApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <View style={{ gap: 28 }}>
        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>
            RESELLERIO
          </Text>
          <BrandedTitle size="hero" title="Sign in to your seller workspace" />
          <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
            Start with the same mobile-first flow as the web app: upload photos, review AI
            suggestions, and publish to your storefront.
          </Text>
        </View>

        <View
          style={{
            gap: 18,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 22,
          }}
        >
          <TextField
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="seller@example.com"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            autoCapitalize="none"
            autoComplete="password"
            placeholder="Your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => {
              void handleSubmit();
            }}
          />

          {error ? <InlineError message={error} /> : null}

          <Button
            label={submitting ? 'Signing in...' : 'Sign in'}
            disabled={submitting || email.trim() === '' || password.trim() === ''}
            onPress={() => {
              void handleSubmit();
            }}
          />

          {__DEV__ ? (
            <Button
              label="Use local test account"
              kind="secondary"
              onPress={() => {
                setEmail(TEST_EMAIL);
                setPassword(TEST_PASSWORD);
                setError(null);
              }}
            />
          ) : null}
        </View>

        <View style={{ gap: 14 }}>
          <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
            New here? Create an account and the app will fetch your plan, usage, and marketplace
            defaults right away.
          </Text>
          <Link href="/sign-up" style={{ color: colors.accent, fontSize: 15, fontWeight: '700' }}>
            Create account
          </Link>
        </View>
      </View>
    </Screen>
  );
}
