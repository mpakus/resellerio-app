import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Screen, SectionCard } from '@/src/components/ui';
import { useAuth } from '@/src/lib/auth/auth-provider';
import { colors } from '@/src/theme/colors';

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleSignOut() {
    setSubmitting(true);

    try {
      await signOut();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scrollable>
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>
            SETTINGS
          </Text>
          <Text style={{ color: colors.text, fontSize: 31, fontWeight: '800', letterSpacing: -0.8 }}>
            Account and storefront base
          </Text>
          <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
            We’re already hydrating plan, usage, marketplaces, and account info from the backend.
            Storefront profile and page editing come next.
          </Text>
        </View>

        <SectionCard
          eyebrow="Account"
          title={session.user.email}
          description={`Plan ${session.user.plan ?? 'free'} · ${session.user.plan_status ?? 'free'}`}
        />

        <SectionCard
          eyebrow="Marketplaces"
          title={
            session.user.selected_marketplaces.length > 0
              ? session.user.selected_marketplaces.join(', ')
              : 'No marketplaces selected yet'
          }
          description={`${session.supportedMarketplaces.length} supported marketplaces returned by the API.`}
        />

        <SectionCard
          eyebrow="Quota"
          title={`${session.usage.price_research}/${session.limits.price_research} price research runs`}
          description={`Add-on credits: ${Object.keys(session.user.addon_credits ?? {}).length}`}
        />

        <Button
          label={submitting ? 'Signing out...' : 'Sign out'}
          kind="secondary"
          disabled={submitting}
          onPress={() => {
            void handleSignOut();
          }}
        />
      </View>
    </Screen>
  );
}
