import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

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
import { useAuth } from '@/src/lib/auth/auth-provider';
import { openExternalUrlSafely, shareExternalUrlSafely } from '@/src/lib/linking/external-url';
import {
  addonCreditsSummary,
  buildStorefrontUrl,
  buildReorderedStorefrontPageIds,
  createStorefrontPageDraft,
  selectedStorefrontTheme,
  storefrontAssetDetails,
  storefrontThemePreviewSwatches,
  subscriptionDetailsSummary,
  visibleStorefrontThemes,
} from '@/src/features/settings/helpers';
import type { StorefrontPage, StorefrontTheme } from '@/src/features/settings/types';
import { useSettingsOverview } from '@/src/features/settings/use-settings-overview';
import {
  describeExportJob,
  describeImportJob,
  formatTransferStatus,
  getExportDisplayName,
  getImportDisplayName,
} from '@/src/features/transfers/helpers';
import { useTransfersOverview } from '@/src/features/transfers/use-transfers-overview';
import { colors } from '@/src/theme/colors';

const PRICING_URL = 'https://resellerio.com/pricing';
const BILLING_URL = 'https://app.lemonsqueezy.com/billing';

function PageActionIconButton({
  accessibilityLabel,
  icon,
  tone = 'default',
  disabled = false,
  onPress,
}: {
  accessibilityLabel: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  tone?: 'default' | 'danger';
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: tone === 'danger' ? '#f0c4bb' : colors.border,
        backgroundColor: tone === 'danger' ? '#fff1ec' : colors.card,
        opacity: disabled || pressed ? 0.65 : 1,
      })}
    >
      <Ionicons
        color={tone === 'danger' ? colors.danger : disabled ? colors.border : colors.text}
        name={icon}
        size={18}
      />
    </Pressable>
  );
}

function ThemePresetCard({
  theme,
  selected,
  title,
  tagline,
  onPress,
}: {
  theme: StorefrontTheme;
  selected: boolean;
  title: string;
  tagline: string;
  onPress: () => void;
}) {
  const colorsMap = theme.colors;
  const pageBackground = colorsMap.page_background ?? '#f7f2e9';
  const surfaceBackground = colorsMap.surface_background ?? '#fffaf4';
  const textColor = colorsMap.text ?? '#1f1f1d';
  const borderColor = colorsMap.border ?? '#d8c6ae';
  const heroStart = colorsMap.secondary_accent ?? '#d9c2a0';
  const heroEnd = colorsMap.hero_overlay ?? colorsMap.primary_button ?? '#f0debe';

  return (
    <Pressable
      accessibilityLabel={`Select theme ${theme.label}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        gap: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: selected ? colors.accent : borderColor,
        backgroundColor: pageBackground,
        padding: 14,
        opacity: pressed ? 0.82 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: textColor, fontSize: 15, fontWeight: '700' }}>{theme.label}</Text>
          <Text style={{ color: textColor, fontSize: 11, opacity: 0.7 }}>{theme.id}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {storefrontThemePreviewSwatches(theme).slice(0, 4).map((swatch) => (
            <View
              key={`${theme.id}-${swatch}`}
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.65)',
                backgroundColor: swatch,
              }}
            />
          ))}
        </View>
      </View>

      <View
        style={{
          gap: 10,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.4)',
          overflow: 'hidden',
          backgroundColor: surfaceBackground,
        }}
      >
        <View
          style={{
            paddingHorizontal: 14,
            paddingVertical: 16,
            backgroundColor: heroStart,
          }}
        >
          <Text style={{ color: textColor, fontSize: 11, opacity: 0.75 }}>Header sample</Text>
          <Text style={{ color: textColor, fontSize: 16, fontWeight: '700', marginTop: 6 }}>{title}</Text>
          <Text style={{ color: textColor, fontSize: 12, lineHeight: 18, marginTop: 4, opacity: 0.8 }}>
            {tagline}
          </Text>
          <View
            style={{
              position: 'absolute',
              right: -18,
              top: -12,
              width: 88,
              height: 88,
              borderRadius: 999,
              backgroundColor: heroEnd,
              opacity: 0.34,
            }}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingBottom: 14 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.45)',
              backgroundColor: heroEnd,
            }}
          />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: textColor, fontSize: 11, opacity: 0.7 }}>Product card</Text>
            <Text style={{ color: textColor, fontSize: 14, fontWeight: '700' }}>Vintage denim jacket</Text>
            <Text style={{ color: textColor, fontSize: 12, opacity: 0.8 }}>$84 · Ready to share</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [pageModalVisible, setPageModalVisible] = useState(false);
  const [editingPage, setEditingPage] = useState<StorefrontPage | null>(null);
  const [deletePageTarget, setDeletePageTarget] = useState<StorefrontPage | null>(null);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [pageDraft, setPageDraft] = useState(createStorefrontPageDraft());
  const {
    user,
    supportedMarketplaces,
    usage,
    limits,
    storefront,
    themes,
    storefrontPages,
    selectedMarketplacesDraft,
    storefrontDraft,
    isLoading,
    isSavingMarketplaces,
    isSavingStorefront,
    isSavingPage,
    uploadingAssetKind,
    deletingAssetKind,
    deletingPageId,
    reorderingPageId,
    error,
    marketplaceError,
    storefrontError,
    brandingError,
    pageError,
    logoAsset,
    headerAsset,
    isMarketplacesDirty,
    isStorefrontDirty,
    refresh,
    toggleMarketplace,
    resetMarketplaceDraft,
    saveMarketplaceDraft,
    updateStorefrontField,
    resetStorefrontDraft,
    saveStorefrontDraft,
    uploadStorefrontAsset,
    removeAsset,
    createPage,
    savePage,
    removePage,
    savePageOrder,
  } = useSettingsOverview(session.token);
  const {
    recentExports,
    recentImports,
    exportNameDraft,
    isLoading: isLoadingTransfers,
    isCreatingExport,
    isImporting,
    error: transfersError,
    exportError,
    importError,
    refresh: refreshTransfers,
    setExportNameDraft,
    startExport,
    startImport,
  } = useTransfersOverview(session.token);

  async function handleSignOut() {
    setSubmitting(true);

    try {
      await signOut();
    } finally {
      setSubmitting(false);
    }
  }

  const storefrontUrl = buildStorefrontUrl(storefront.slug);
  const selectedTheme = selectedStorefrontTheme(themes, storefrontDraft.theme_id);
  const visibleThemes = visibleStorefrontThemes(themes, showAllThemes, storefrontDraft.theme_id);

  async function confirmDeletePage() {
    if (!deletePageTarget) {
      return;
    }

    const didDelete = await removePage(deletePageTarget.id);

    if (didDelete) {
      setDeletePageTarget(null);
    }
  }

  return (
    <Screen scrollable>
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>
            SETTINGS
          </Text>
          <BrandedTitle title="Account and storefront" />
          <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
            Manage marketplace defaults, storefront profile settings, informational pages, and account usage from the mobile workspace.
          </Text>
        </View>

        <Button
          label="Refresh data"
          kind="secondary"
          onPress={() => {
            refresh();
            refreshTransfers();
          }}
        />

        {error ? <InlineError message={error} /> : null}
        {transfersError ? <InlineError message={transfersError} /> : null}

        <SectionCard
          eyebrow="Account"
          title={user.email}
          description={`Plan ${user.plan ?? 'free'} · ${subscriptionDetailsSummary(user)}`}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              label="Open storefront"
              kind="secondary"
              disabled={!storefrontUrl}
              onPress={() => {
                if (storefrontUrl) {
                  void openExternalUrlSafely(storefrontUrl);
                }
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Share storefront"
              kind="secondary"
              disabled={!storefrontUrl}
              onPress={() => {
                if (storefrontUrl) {
                  void shareExternalUrlSafely(storefrontUrl);
                }
              }}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              label="View plans"
              kind="secondary"
              onPress={() => {
                void openExternalUrlSafely(PRICING_URL);
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Manage billing"
              kind="secondary"
              onPress={() => {
                void openExternalUrlSafely(BILLING_URL);
              }}
            />
          </View>
        </View>

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
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
              MARKETPLACES
            </Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
              {selectedMarketplacesDraft.length} selected
            </Text>
            <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
              {supportedMarketplaces.length} supported marketplaces available for AI listing generation.
            </Text>
          </View>

          {marketplaceError ? <InlineError message={marketplaceError} /> : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {supportedMarketplaces.map((marketplace) => {
                const isActive = selectedMarketplacesDraft.includes(marketplace.id);

                return (
                  <Pressable
                    key={marketplace.id}
                    onPress={() => {
                      toggleMarketplace(marketplace.id);
                    }}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: isActive ? colors.accent : colors.border,
                      backgroundColor: isActive ? colors.accentSoft : colors.card,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                      {marketplace.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={isSavingMarketplaces ? 'Saving...' : 'Save'}
                disabled={!isMarketplacesDirty || isSavingMarketplaces}
                onPress={() => {
                  void saveMarketplaceDraft();
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Reset"
                kind="secondary"
                disabled={!isMarketplacesDirty || isSavingMarketplaces}
                onPress={resetMarketplaceDraft}
              />
            </View>
          </View>
        </View>

        <SectionCard
          eyebrow="Quota"
          title={`${usage.price_research}/${limits.price_research} price research runs`}
          description={`AI drafts ${usage.ai_drafts}/${limits.ai_drafts} · Background removal ${usage.background_removals}/${limits.background_removals} · Lifestyle ${usage.lifestyle}/${limits.lifestyle}`}
        />

        <SectionCard
          eyebrow="Credits"
          title={user.plan_period ?? 'Current subscription'}
          description={addonCreditsSummary(user.addon_credits ?? {})}
        />

        <View
          style={{
            gap: 16,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 18,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
              TRANSFERS
            </Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
              Export and import catalog ZIPs
            </Text>
            <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
              Start full-catalog exports, download finished ZIPs, and import reseller archives from the device. Recent jobs are kept locally on this device because the public API exposes create and status endpoints, not list endpoints.
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            <TextField
              label="Export name"
              placeholder="Optional label for this export"
              value={exportNameDraft}
              onChangeText={setExportNameDraft}
            />
            {exportError ? <InlineError message={exportError} /> : null}
            <Button
              label={isCreatingExport ? 'Starting export...' : 'Start catalog export'}
              disabled={isCreatingExport}
              onPress={() => {
                void startExport();
              }}
            />
          </View>

          <View style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>Recent exports</Text>

            {isLoadingTransfers ? (
              <Text style={{ color: colors.mutedText, fontSize: 14 }}>Loading recent transfers...</Text>
            ) : null}

            {!isLoadingTransfers && recentExports.length === 0 ? (
              <SectionCard
                eyebrow="No exports"
                title="No catalog exports yet"
                description="Start a catalog export to prepare a ZIP with spreadsheet data, manifest metadata, and product images."
              />
            ) : null}

            {recentExports.map((job) => (
              <View
                key={job.id}
                style={{
                  gap: 10,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  padding: 14,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                  {getExportDisplayName(job)}
                </Text>
                <Text style={{ color: colors.mutedText, fontSize: 14 }}>
                  {formatTransferStatus(job.status)} · {describeExportJob(job)}
                </Text>
                {job.error_message ? (
                  <Text style={{ color: colors.danger, fontSize: 14 }}>{job.error_message}</Text>
                ) : null}
                {job.download_url ? (
                  <Button
                    label="Open export download"
                    kind="secondary"
                    onPress={() => {
                      void openExternalUrlSafely(job.download_url);
                    }}
                  />
                ) : null}
              </View>
            ))}
          </View>

          <View style={{ gap: 10 }}>
            {importError ? <InlineError message={importError} /> : null}
            <Button
              label={isImporting ? 'Importing ZIP...' : 'Import ZIP archive'}
              kind="secondary"
              disabled={isImporting}
              onPress={() => {
                void startImport();
              }}
            />
          </View>

          <View style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>Recent imports</Text>

            {!isLoadingTransfers && recentImports.length === 0 ? (
              <SectionCard
                eyebrow="No imports"
                title="No catalog imports yet"
                description="Pick a ZIP archive from the device to recreate products and media in the seller workspace."
              />
            ) : null}

            {recentImports.map((job) => (
              <View
                key={job.id}
                style={{
                  gap: 10,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  padding: 14,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                  {getImportDisplayName(job)}
                </Text>
                <Text style={{ color: colors.mutedText, fontSize: 14 }}>
                  {formatTransferStatus(job.status)} · {describeImportJob(job)}
                </Text>
                {job.error_message ? (
                  <Text style={{ color: colors.danger, fontSize: 14 }}>{job.error_message}</Text>
                ) : null}
                {Array.isArray(job.failure_details.items) && job.failure_details.items.length > 0 ? (
                  <Text style={{ color: colors.mutedText, fontSize: 13 }}>
                    Failure details available for {job.failure_details.items.length} item(s).
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            gap: 16,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 18,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
              STOREFRONT PROFILE
            </Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
              Settings
            </Text>
          </View>

          <View
            style={{
              gap: 10,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              padding: 14,
            }}
          >
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
              PUBLIC URL
            </Text>
            <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
              {storefrontUrl
                ? 'Open or share the public storefront directly from mobile.'
                : 'Save a storefront slug first to enable public storefront links.'}
            </Text>
            {storefrontUrl ? (
              <LinkText
                label={storefrontUrl}
                onPress={() => {
                  void openExternalUrlSafely(storefrontUrl);
                }}
              />
            ) : (
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                Storefront URL unavailable
              </Text>
            )}
          </View>

          {storefrontError ? <InlineError message={storefrontError} /> : null}

          <TextField
            label="Slug"
            value={storefrontDraft.slug}
            onChangeText={(value) => {
              updateStorefrontField('slug', value);
            }}
          />
          <TextField
            label="Title"
            value={storefrontDraft.title}
            onChangeText={(value) => {
              updateStorefrontField('title', value);
            }}
          />
          <TextField
            label="Tagline"
            value={storefrontDraft.tagline}
            onChangeText={(value) => {
              updateStorefrontField('tagline', value);
            }}
          />
          <TextField
            label="Description"
            multiline
            numberOfLines={4}
            value={storefrontDraft.description}
            onChangeText={(value) => {
              updateStorefrontField('description', value);
            }}
          />
          <View style={{ gap: 10 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>Selected theme</Text>
              <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
                {selectedTheme ? selectedTheme.label : 'No theme preset available'}
              </Text>
            </View>

            {visibleThemes.length > 0 ? (
              <View style={{ gap: 12 }}>
                {visibleThemes.map((theme) => (
                  <ThemePresetCard
                    key={theme.id}
                    theme={theme}
                    selected={storefrontDraft.theme_id === theme.id}
                    title={storefrontDraft.title || 'Your storefront'}
                    tagline={storefrontDraft.tagline || 'Curated resale inventory and quick shipping.'}
                    onPress={() => {
                      updateStorefrontField('theme_id', theme.id);
                    }}
                  />
                ))}
              </View>
            ) : null}

            {themes.length > 2 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setShowAllThemes((current) => !current);
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  alignSelf: 'flex-start',
                  opacity: pressed ? 0.72 : 1,
                })}
              >
                <Ionicons
                  color={colors.mutedText}
                  name={showAllThemes ? 'chevron-up' : 'chevron-down'}
                  size={16}
                />
                <Text style={{ color: colors.mutedText, fontSize: 14, fontWeight: '600' }}>
                  {showAllThemes ? 'Show fewer themes' : `Show all ${themes.length} themes`}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>Storefront status</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { label: 'Enabled', value: true },
                { label: 'Disabled', value: false },
              ].map((option) => {
                const isActive = storefrontDraft.enabled === option.value;

                return (
                  <Pressable
                    key={option.label}
                    onPress={() => {
                      updateStorefrontField('enabled', option.value);
                    }}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: isActive ? colors.accent : colors.border,
                      backgroundColor: isActive ? colors.accentSoft : colors.card,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <SectionCard
            eyebrow="Branding"
            title="Logo and header"
            description="Upload one logo and one storefront header image, or replace either asset at any time."
          />

          {brandingError ? <InlineError message={brandingError} /> : null}

          {[
            { kind: 'logo' as const, title: 'Logo', asset: logoAsset },
            { kind: 'header' as const, title: 'Header', asset: headerAsset },
          ].map((item) => (
            <View
              key={item.kind}
              style={{
                gap: 10,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
                padding: 14,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{item.title}</Text>
              {item.asset?.url ? (
                <Pressable
                  accessibilityLabel={`Open ${item.title.toLowerCase()} preview`}
                  accessibilityRole="button"
                  onPress={() => {
                    void openExternalUrlSafely(item.asset?.url);
                  }}
                  style={({ pressed }) => ({
                    overflow: 'hidden',
                    borderRadius: 18,
                    opacity: pressed ? 0.78 : 1,
                  })}
                >
                  <Image
                    accessibilityLabel={`${item.title} preview`}
                    contentFit="cover"
                    source={{ uri: item.asset.url }}
                    style={{
                      width: '100%',
                      height: item.kind === 'logo' ? 120 : 140,
                      borderRadius: 18,
                      backgroundColor: colors.card,
                    }}
                  />
                </Pressable>
              ) : null}
              {!item.asset?.url ? (
                <Text style={{ color: colors.mutedText, fontSize: 14 }}>
                  {storefrontAssetDetails(item.asset)}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <PageActionIconButton
                  accessibilityLabel={
                    item.asset
                      ? `Replace ${item.title.toLowerCase()}`
                      : `Upload ${item.title.toLowerCase()}`
                  }
                  icon="cloud-upload-outline"
                  disabled={uploadingAssetKind !== null}
                  onPress={() => {
                    void uploadStorefrontAsset(item.kind);
                  }}
                />
                <PageActionIconButton
                  accessibilityLabel={`Remove ${item.title.toLowerCase()}`}
                  icon="trash-outline"
                  tone="danger"
                  disabled={!item.asset || deletingAssetKind !== null}
                  onPress={() => {
                    void removeAsset(item.kind);
                  }}
                />
              </View>
            </View>
          ))}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={isSavingStorefront ? 'Saving...' : 'Save'}
                disabled={!isStorefrontDirty || isSavingStorefront}
                onPress={() => {
                  void saveStorefrontDraft();
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Reset"
                kind="secondary"
                disabled={!isStorefrontDirty || isSavingStorefront}
                onPress={resetStorefrontDraft}
              />
            </View>
          </View>
        </View>

        <View
          style={{
            gap: 16,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 18,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
              STOREFRONT PAGES
            </Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
              Informational pages
            </Text>
            <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
              Create, edit, publish, delete, and reorder About, Shipping, Returns, and similar storefront pages.
            </Text>
          </View>

          {pageError ? <InlineError message={pageError} /> : null}

          <Button
            label="Create page"
            kind="secondary"
            onPress={() => {
              setEditingPage(null);
              setPageDraft(createStorefrontPageDraft());
              setPageModalVisible(true);
            }}
          />

          {isLoading ? (
            <Text style={{ color: colors.mutedText, fontSize: 14 }}>Loading storefront pages...</Text>
          ) : null}

          {!isLoading && storefrontPages.length === 0 ? (
            <SectionCard
              eyebrow="Empty"
              title="No storefront pages yet"
              description="Save the storefront profile first, then create About, Shipping, Returns, or other support pages."
            />
          ) : null}

          {storefrontPages.map((page, index) => (
            <View
              key={page.id}
              style={{
                gap: 10,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
                padding: 14,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                {page.title} · {page.published ? 'Published' : 'Draft'}
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: 14 }}>
                /{page.slug} · {page.menu_label ?? page.title}
              </Text>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 22 }}>
                {page.body ?? 'No body content yet.'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <PageActionIconButton
                  accessibilityLabel={`Edit page ${page.title}`}
                  icon="pencil-outline"
                  onPress={() => {
                    setEditingPage(page);
                    setPageDraft(createStorefrontPageDraft(page));
                    setPageModalVisible(true);
                  }}
                />
                <PageActionIconButton
                  accessibilityLabel={`Move page ${page.title} up`}
                  icon="arrow-up"
                  disabled={reorderingPageId === page.id || index === 0}
                  onPress={() => {
                    const nextIds = buildReorderedStorefrontPageIds(
                      storefrontPages.map((item) => item.id),
                      page.id,
                      'earlier',
                    );
                    void savePageOrder(nextIds, page.id);
                  }}
                />
                <PageActionIconButton
                  accessibilityLabel={`Move page ${page.title} down`}
                  icon="arrow-down"
                  disabled={reorderingPageId === page.id || index === storefrontPages.length - 1}
                  onPress={() => {
                    const nextIds = buildReorderedStorefrontPageIds(
                      storefrontPages.map((item) => item.id),
                      page.id,
                      'later',
                    );
                    void savePageOrder(nextIds, page.id);
                  }}
                />
                <PageActionIconButton
                  accessibilityLabel={`Delete page ${page.title}`}
                  icon="trash-outline"
                  tone="danger"
                  disabled={deletingPageId === page.id}
                  onPress={() => {
                    setDeletePageTarget(page);
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        <Button
          label={submitting ? 'Signing out...' : 'Sign out'}
          kind="secondary"
          disabled={submitting}
          onPress={() => {
            void handleSignOut();
          }}
        />
      </View>

      <DialogModal
        visible={pageModalVisible}
        title={editingPage ? `Edit ${editingPage.title}` : 'Create storefront page'}
        description="Manage page title, slug, menu label, published state, and body content."
        onClose={() => {
          if (!isSavingPage) {
            setPageModalVisible(false);
          }
        }}
      >
        <View style={{ gap: 12 }}>
          <TextField
            label="Title"
            value={pageDraft.title}
            onChangeText={(value) => {
              setPageDraft((current) => ({ ...current, title: value }));
            }}
          />
          <TextField
            label="Slug"
            value={pageDraft.slug}
            onChangeText={(value) => {
              setPageDraft((current) => ({ ...current, slug: value }));
            }}
          />
          <TextField
            label="Menu label"
            value={pageDraft.menu_label}
            onChangeText={(value) => {
              setPageDraft((current) => ({ ...current, menu_label: value }));
            }}
          />
          <TextField
            label="Body"
            multiline
            numberOfLines={5}
            value={pageDraft.body}
            onChangeText={(value) => {
              setPageDraft((current) => ({ ...current, body: value }));
            }}
          />

          <View style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>Publish status</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { label: 'Published', value: true },
                { label: 'Draft', value: false },
              ].map((option) => {
                const isActive = pageDraft.published === option.value;

                return (
                  <Pressable
                    key={option.label}
                    onPress={() => {
                      setPageDraft((current) => ({ ...current, published: option.value }));
                    }}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: isActive ? colors.accent : colors.border,
                      backgroundColor: isActive ? colors.accentSoft : colors.card,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={
                  isSavingPage
                    ? editingPage
                      ? 'Saving page...'
                      : 'Creating page...'
                    : editingPage
                      ? 'Save page'
                      : 'Create page'
                }
                disabled={isSavingPage}
                onPress={() => {
                  const action = editingPage
                    ? savePage(editingPage.id, pageDraft)
                    : createPage(pageDraft);

                  void action.then((saved) => {
                    if (saved) {
                      setPageModalVisible(false);
                    }
                  });
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Cancel"
                kind="secondary"
                disabled={isSavingPage}
                onPress={() => {
                  setPageModalVisible(false);
                }}
              />
            </View>
          </View>
        </View>
      </DialogModal>

      <DialogModal
        visible={deletePageTarget !== null}
        title={deletePageTarget ? `Delete ${deletePageTarget.title}?` : 'Delete page'}
        description="This will permanently remove the storefront page."
        showCloseButton
        closeLabel="Close delete page dialog"
        onClose={() => {
          if (deletingPageId === null) {
            setDeletePageTarget(null);
          }
        }}
      >
        <View style={{ gap: 12 }}>
          <Text selectable style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
            You can recreate the page later, but its current content and position will be lost.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={deletePageTarget && deletingPageId === deletePageTarget.id ? 'Deleting...' : 'Delete'}
                kind="secondary"
                disabled={deletePageTarget ? deletingPageId === deletePageTarget.id : true}
                onPress={() => {
                  void confirmDeletePage();
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Cancel"
                kind="secondary"
                disabled={deletePageTarget ? deletingPageId === deletePageTarget.id : false}
                onPress={() => {
                  setDeletePageTarget(null);
                }}
              />
            </View>
          </View>
        </View>
      </DialogModal>
    </Screen>
  );
}
