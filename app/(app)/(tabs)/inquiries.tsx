import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  BrandedTitle,
  Button,
  DialogModal,
  InlineError,
  LinkText,
  Screen,
  SectionCard,
  TextField,
} from '@/src/components/ui';
import {
  inquiryContactText,
  formatInquiryTimestamp,
  inquiryDisplayName,
  inquiryPrimaryText,
} from '@/src/features/inquiries/helpers';
import type { Inquiry } from '@/src/features/inquiries/types';
import { buildPublicAppUrl } from '@/src/features/settings/helpers';
import { useInquiriesOverview } from '@/src/features/inquiries/use-inquiries-overview';
import { useAuth } from '@/src/lib/auth/auth-provider';
import { openExternalUrlSafely } from '@/src/lib/linking/external-url';
import { colors } from '@/src/theme/colors';

type InquiryListItemProps = {
  inquiry: Inquiry;
  onPress: () => void;
};

function InquiryListItem({ inquiry, onPress }: InquiryListItemProps) {
  return (
    <Pressable
      accessibilityLabel={`Open inquiry from ${inquiryDisplayName(inquiry)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        {
          gap: 12,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          padding: 18,
        },
        pressed && { opacity: 0.72 },
      ]}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
          FULL NAME
        </Text>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
          {inquiryDisplayName(inquiry)}
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
          CONTACT
        </Text>
        <Text style={{ color: colors.mutedText, fontSize: 15, lineHeight: 22 }}>
          {inquiryContactText(inquiry)}
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
          DATE TIME
        </Text>
        <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
          {formatInquiryTimestamp(inquiry.inserted_at)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function InquiriesScreen() {
  const { session } = useAuth();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
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

  async function handleDeleteSelectedInquiry() {
    if (!selectedInquiry) {
      return;
    }

    const didDelete = await removeInquiry(selectedInquiry.id);

    if (didDelete) {
      setSelectedInquiry(null);
    }
  }

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
          <InquiryListItem
            key={inquiry.id}
            inquiry={inquiry}
            onPress={() => {
              setSelectedInquiry(inquiry);
            }}
          />
        ))}

        {pagination.page < pagination.total_pages ? (
          <Button label="Load more inquiries" kind="secondary" onPress={loadNextPage} />
        ) : null}
      </View>

      <DialogModal
        visible={selectedInquiry !== null}
        title={selectedInquiry ? inquiryDisplayName(selectedInquiry) : 'Inquiry'}
        description={
          selectedInquiry ? `Received ${formatInquiryTimestamp(selectedInquiry.inserted_at)}` : undefined
        }
        showCloseButton
        closeLabel="Close inquiry"
        onClose={() => {
          setSelectedInquiry(null);
        }}
      >
        {selectedInquiry ? (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 6 }}>
              <Text selectable style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
                FULL NAME
              </Text>
              <Text selectable style={{ color: colors.text, fontSize: 16, lineHeight: 24 }}>
                {inquiryDisplayName(selectedInquiry)}
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text selectable style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
                CONTACT
              </Text>
              <Text selectable style={{ color: colors.text, fontSize: 16, lineHeight: 24 }}>
                {inquiryContactText(selectedInquiry)}
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text selectable style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
                MESSAGE
              </Text>
              <Text selectable style={{ color: colors.text, fontSize: 16, lineHeight: 24 }}>
                {inquiryPrimaryText(selectedInquiry)}
              </Text>
            </View>

            {buildPublicAppUrl(selectedInquiry.source_path) ? (
              <LinkText
                label={selectedInquiry.source_path!}
                onPress={() => {
                  void openExternalUrlSafely(buildPublicAppUrl(selectedInquiry.source_path));
                }}
              />
            ) : null}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {selectedInquiry.product_id ? (
                <View style={{ flex: 1 }}>
                  <Button
                    label="Open product"
                    kind="secondary"
                    onPress={() => {
                      router.push(`/products/${selectedInquiry.product_id}`);
                    }}
                  />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Button
                  label={deletingInquiryId === selectedInquiry.id ? 'Deleting...' : 'Delete'}
                  kind="secondary"
                  disabled={deletingInquiryId === selectedInquiry.id}
                  onPress={() => {
                    void handleDeleteSelectedInquiry();
                  }}
                />
              </View>
            </View>
          </View>
        ) : null}
      </DialogModal>
    </Screen>
  );
}
