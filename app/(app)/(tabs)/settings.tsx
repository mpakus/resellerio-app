import { useState } from 'react';
import * as Linking from 'expo-linking';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';

import {
  BrandedTitle,
  Button,
  DialogModal,
  InlineError,
  Screen,
  SectionCard,
  TextField,
} from '@/src/components/ui';
import { useAuth } from '@/src/lib/auth/auth-provider';
import {
  addonCreditsSummary,
  buildStorefrontUrl,
  buildReorderedStorefrontPageIds,
  createStorefrontPageDraft,
  storefrontAssetDetails,
  storefrontAssetSummary,
  subscriptionDetailsSummary,
} from '@/src/features/settings/helpers';
import type { StorefrontPage } from '@/src/features/settings/types';
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

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [pageModalVisible, setPageModalVisible] = useState(false);
  const [editingPage, setEditingPage] = useState<StorefrontPage | null>(null);
  const [pageDraft, setPageDraft] = useState(createStorefrontPageDraft());
  const {
    user,
    supportedMarketplaces,
    usage,
    limits,
    storefront,
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

  function openExternalUrl(url: string) {
    void Linking.openURL(url);
  }

  const storefrontUrl = buildStorefrontUrl(storefront.slug);

  async function shareExternalUrl(url: string) {
    await Share.share({
      message: url,
      url,
    });
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
          description={`Plan ${user.plan ?? 'free'} · ${subscriptionDetailsSummary(
            storefrontUrl,
            user,
          )}`}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              label="Open storefront"
              kind="secondary"
              disabled={!storefrontUrl}
              onPress={() => {
                if (storefrontUrl) {
                  openExternalUrl(storefrontUrl);
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
                  void shareExternalUrl(storefrontUrl);
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
                openExternalUrl(PRICING_URL);
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Manage billing"
              kind="secondary"
              onPress={() => {
                openExternalUrl(BILLING_URL);
              }}
            />
          </View>
        </View>

        <SectionCard
          eyebrow="Marketplaces"
          title={`${selectedMarketplacesDraft.length} selected`}
          description={`${supportedMarketplaces.length} supported marketplaces available for AI listing generation.`}
        />

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
              label={isSavingMarketplaces ? 'Saving marketplaces...' : 'Save marketplaces'}
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
                      openExternalUrl(job.download_url!);
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
              Seller-facing storefront settings
            </Text>
            <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
              Save slug, title, tagline, description, theme, and enabled state with the mobile storefront API.
            </Text>
          </View>

          <SectionCard
            eyebrow="Public URL"
            title={storefrontUrl ?? 'Storefront URL unavailable'}
            description={
              storefrontUrl
                ? 'Open or share the public storefront directly from mobile.'
                : 'Save a storefront slug first to enable public storefront links.'
            }
          />

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
          <TextField
            label="Theme ID"
            value={storefrontDraft.theme_id}
            onChangeText={(value) => {
              updateStorefrontField('theme_id', value);
            }}
          />

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
            title={storefrontAssetSummary(storefront)}
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
              <Text style={{ color: colors.mutedText, fontSize: 14 }}>
                {storefrontAssetDetails(item.asset)}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label={
                      uploadingAssetKind === item.kind
                        ? `Uploading ${item.title.toLowerCase()}...`
                        : item.asset
                          ? `Replace ${item.title.toLowerCase()}`
                          : `Upload ${item.title.toLowerCase()}`
                    }
                    kind="secondary"
                    disabled={uploadingAssetKind !== null}
                    onPress={() => {
                      void uploadStorefrontAsset(item.kind);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label={
                      deletingAssetKind === item.kind
                        ? `Removing ${item.title.toLowerCase()}...`
                        : `Remove ${item.title.toLowerCase()}`
                    }
                    kind="secondary"
                    disabled={!item.asset || deletingAssetKind !== null}
                    onPress={() => {
                      void removeAsset(item.kind);
                    }}
                  />
                </View>
              </View>
            </View>
          ))}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={isSavingStorefront ? 'Saving storefront...' : 'Save storefront'}
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
                <View style={{ flex: 1 }}>
                  <Button
                    label="Edit"
                    kind="secondary"
                    onPress={() => {
                      setEditingPage(page);
                      setPageDraft(createStorefrontPageDraft(page));
                      setPageModalVisible(true);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Move earlier"
                    kind="secondary"
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
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Move later"
                    kind="secondary"
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
                </View>
              </View>
              <Button
                label={deletingPageId === page.id ? 'Deleting page...' : 'Delete page'}
                kind="secondary"
                disabled={deletingPageId === page.id}
                onPress={() => {
                  void removePage(page.id);
                }}
              />
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
    </Screen>
  );
}
