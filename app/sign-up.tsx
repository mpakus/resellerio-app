import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, InlineError, Screen, TextField } from '@/src/components/ui';
import { useAuth } from '@/src/lib/auth/auth-provider';
import { formatApiError } from '@/src/lib/api/client';
import { colors } from '@/src/theme/colors';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      await signUp({ email, password });
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
            CREATE ACCOUNT
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 34,
              fontWeight: '800',
              letterSpacing: -0.8,
            }}
          >
            Set up your mobile seller account
          </Text>
          <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
            Registration uses the same API as the web product. After sign-up we hydrate the session
            with your profile, supported marketplaces, and current usage limits.
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => {
              void handleSubmit();
            }}
          />

          {error ? <InlineError message={error} /> : null}

          <Button
            label={submitting ? 'Creating account...' : 'Create account'}
            disabled={submitting || email.trim() === '' || password.trim() === ''}
            onPress={() => {
              void handleSubmit();
            }}
          />
        </View>

        <View style={{ gap: 14 }}>
          <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
            Already have an account? Sign in with the provided local test account or your own seller
            login.
          </Text>
          <Link href="/sign-in" style={{ color: colors.accent, fontSize: 15, fontWeight: '700' }}>
            Back to sign in
          </Link>
        </View>
      </View>
    </Screen>
  );
}
