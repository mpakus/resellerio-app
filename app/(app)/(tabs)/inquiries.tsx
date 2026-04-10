import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  BrandedTitle,
  Button,
  DialogModal,
  InlineError,
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
import { useInquiriesOverview } from '@/src/features/inquiries/use-inquiries-overview';
import { useAuth } from '@/src/lib/auth/auth-provider';
import { colors } from '@/src/theme/colors';

type InquiryListItemProps = {
  inquiry: Inquiry;
  onPress: () => void;
};

type InquiryModalActionButtonProps = {
  accessibilityLabel: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
};

function InquiryModalActionButton({
  accessibilityLabel,
  icon,
  onPress,
  disabled = false,
  tone = 'default',
}: InquiryModalActionButtonProps) {
  const isDanger = tone === 'danger';

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 54,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: isDanger ? '#f0c4bb' : colors.border,
        backgroundColor: isDanger ? '#fff1ec' : colors.card,
        opacity: disabled || pressed ? 0.65 : 1,
      })}
    >
      <Ionicons
        color={isDanger ? colors.danger : colors.text}
        name={icon}
        size={22}
      />
    </Pressable>
  );
}

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
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
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
      setDeleteConfirmVisible(false);
      setSelectedInquiry(null);
    }
  }

  function closeInquiryModal() {
    setDeleteConfirmVisible(false);
    setSelectedInquiry(null);
  }

  function closeDeleteConfirm() {
    setDeleteConfirmVisible(false);
  }

  return (
    <Screen includeBottomInset={false} includeTopInset={false} scrollable>
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
        title={
          deleteConfirmVisible
            ? 'Delete this inquiry?'
            : selectedInquiry
              ? inquiryDisplayName(selectedInquiry)
              : 'Inquiry'
        }
        description={
          deleteConfirmVisible
            ? 'This permanently removes the inquiry from the seller inbox.'
            : selectedInquiry
              ? `Received ${formatInquiryTimestamp(selectedInquiry.inserted_at)}`
              : undefined
        }
        showCloseButton
        closeLabel="Close inquiry"
        onClose={() => {
          if (deleteConfirmVisible) {
            closeDeleteConfirm();
            return;
          }

          closeInquiryModal();
        }}
      >
        {selectedInquiry ? (
          deleteConfirmVisible ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button
                  label={deletingInquiryId === selectedInquiry.id ? 'Deleting...' : 'Delete'}
                  disabled={deletingInquiryId === selectedInquiry.id}
                  onPress={() => {
                    void handleDeleteSelectedInquiry();
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label="Cancel"
                  kind="secondary"
                  disabled={deletingInquiryId === selectedInquiry.id}
                  onPress={closeDeleteConfirm}
                />
              </View>
            </View>
          ) : (
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

              <View style={{ flexDirection: 'row', gap: 12 }}>
                {selectedInquiry.product_id ? (
                  <InquiryModalActionButton
                    accessibilityLabel="Open Product"
                    icon="open-outline"
                    onPress={() => {
                      router.push(`/products/${selectedInquiry.product_id}`);
                    }}
                  />
                ) : null}
                <InquiryModalActionButton
                  accessibilityLabel="Close inquiry actions"
                  icon="close-outline"
                  onPress={closeInquiryModal}
                />
                <InquiryModalActionButton
                  accessibilityLabel="Delete inquiry"
                  icon="trash-outline"
                  tone="danger"
                  disabled={deletingInquiryId === selectedInquiry.id}
                  onPress={() => {
                    setDeleteConfirmVisible(true);
                  }}
                />
              </View>
            </View>
          )
        ) : null}
      </DialogModal>
    </Screen>
  );
}
