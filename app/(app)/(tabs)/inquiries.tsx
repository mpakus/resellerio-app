import { Text, View } from 'react-native';

import { Screen, SectionCard } from '@/src/components/ui';
import { colors } from '@/src/theme/colors';

export default function InquiriesScreen() {
  return (
    <Screen scrollable>
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>
            STOREFRONT
          </Text>
          <Text style={{ color: colors.text, fontSize: 31, fontWeight: '800', letterSpacing: -0.8 }}>
            Inquiries are queued next
          </Text>
          <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
            This tab is ready behind auth. The next dedicated implementation pass can connect
            `GET /api/v1/inquiries`, search, pagination, and delete actions.
          </Text>
        </View>

        <SectionCard
          eyebrow="Planned"
          title="Searchable inquiry inbox"
          description="We’ll mirror the web workspace with inquiry rows showing contact, message, source path, product context, and delete actions."
        />
      </View>
    </Screen>
  );
}
