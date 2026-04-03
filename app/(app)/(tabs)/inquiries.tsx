import { router } from 'expo-router';
import { Linking, Text, View } from 'react-native';

import {
  BrandedTitle,
  Button,
  InlineError,
  LinkText,
  Screen,
  SectionCard,
  TextField,
} from '@/src/components/ui';
import {
  formatInquiryTimestamp,
  inquiryDisplayName,
  inquiryPrimaryText,
  inquirySecondaryText,
} from '@/src/features/inquiries/helpers';
import { buildPublicAppUrl } from '@/src/features/settings/helpers';
import { useInquiriesOverview } from '@/src/features/inquiries/use-inquiries-overview';
import { useAuth } from '@/src/lib/auth/auth-provider';
import { colors } from '@/src/theme/colors';

export default function InquiriesScreen() {
  const { session } = useAuth();
  const {
    inquiries,
    filters,
    searchDraft,
    setSearchDraft,
    pagination,
    isLoading,
    deletingInquiryId,
    error,
    refresh,
    submitSearch,
    clearSearch,
    loadNextPage,
    removeInquiry,
  } = useInquiriesOverview(session.token);

  return (
    <Screen scrollable>
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>
            STOREFRONT
          </Text>
          <BrandedTitle title="Inquiry inbox" />
          <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
            Review storefront leads, search by buyer/contact/message, and jump into the linked product when available.
          </Text>
        </View>

        <Button label="Refresh inbox" kind="secondary" onPress={refresh} />

        {error ? <InlineError message={error} /> : null}

        <View
          style={{
            gap: 12,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 18,
          }}
        >
          <TextField
            label="Search inquiries"
            value={searchDraft}
            onChangeText={setSearchDraft}
            placeholder="Buyer name, contact, or message"
            returnKeyType="search"
            onSubmitEditing={submitSearch}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button label="Search" onPress={submitSearch} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Clear" kind="secondary" onPress={clearSearch} />
            </View>
          </View>
        </View>

        <SectionCard
          eyebrow="Inbox"
          title={`${pagination.total_count} inquiry${pagination.total_count === 1 ? '' : 'ies'} found`}
          description={
            filters.query
              ? `Search results for "${filters.query}".`
              : 'All storefront inquiries for the signed-in seller.'
          }
        />

        {isLoading ? (
          <Text style={{ color: colors.mutedText, fontSize: 15 }}>Loading inquiries...</Text>
        ) : null}

        {!isLoading && inquiries.length === 0 ? (
          <SectionCard
            eyebrow="Empty"
            title={filters.query ? 'No matching inquiries' : 'No inquiries yet'}
            description={
              filters.query
                ? 'Try a different search phrase.'
                : 'Storefront inquiries will appear here when shoppers contact the seller.'
            }
          />
        ) : null}

        {inquiries.map((inquiry) => (
          <View
            key={inquiry.id}
            style={{
              gap: 12,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 18,
            }}
          >
            <View style={{ gap: 6 }}>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                {inquiryDisplayName(inquiry)}
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
                {inquirySecondaryText(inquiry)}
              </Text>
              <Text style={{ color: colors.text, fontSize: 15, lineHeight: 24 }}>
                {inquiryPrimaryText(inquiry)}
              </Text>
            </View>

            <Text style={{ color: colors.mutedText, fontSize: 13 }}>
              {formatInquiryTimestamp(inquiry.inserted_at)}
            </Text>

            {buildPublicAppUrl(inquiry.source_path) ? (
              <LinkText
                label={inquiry.source_path!}
                onPress={() => {
                  void Linking.openURL(buildPublicAppUrl(inquiry.source_path)!);
                }}
              />
            ) : null}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {inquiry.product_id ? (
                <View style={{ flex: 1 }}>
                  <Button
                    label="Open product"
                    kind="secondary"
                    onPress={() => {
                      router.push(`/products/${inquiry.product_id}`);
                    }}
                  />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Button
                  label={deletingInquiryId === inquiry.id ? 'Deleting...' : 'Delete'}
                  kind="secondary"
                  disabled={deletingInquiryId === inquiry.id}
                  onPress={() => {
                    void removeInquiry(inquiry.id);
                  }}
                />
              </View>
            </View>
          </View>
        ))}

        {pagination.page < pagination.total_pages ? (
          <Button label="Load more inquiries" kind="secondary" onPress={loadNextPage} />
        ) : null}
      </View>
    </Screen>
  );
}
