import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
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
  buildReorderedStorefrontPageIds,
  createStorefrontPageDraft,
  storefrontAssetSummary,
} from '@/src/features/settings/helpers';
import type { StorefrontPage } from '@/src/features/settings/types';
import { useSettingsOverview } from '@/src/features/settings/use-settings-overview';
import { colors } from '@/src/theme/colors';

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
    deletingPageId,
    reorderingPageId,
    error,
    marketplaceError,
    storefrontError,
    pageError,
    isMarketplacesDirty,
    isStorefrontDirty,
    refresh,
    toggleMarketplace,
    resetMarketplaceDraft,
    saveMarketplaceDraft,
    updateStorefrontField,
    resetStorefrontDraft,
    saveStorefrontDraft,
    createPage,
    savePage,
    removePage,
    savePageOrder,
  } = useSettingsOverview(session.token);

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
            Account and storefront
          </Text>
          <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
            Manage marketplace defaults, storefront profile settings, informational pages, and account usage from the mobile workspace.
          </Text>
        </View>

        <Button label="Refresh settings" kind="secondary" onPress={refresh} />

        {error ? <InlineError message={error} /> : null}

        <SectionCard
          eyebrow="Account"
          title={user.email}
          description={`Plan ${user.plan ?? 'free'} · ${user.plan_status ?? 'free'}${user.plan_expires_at ? ` · expires ${user.plan_expires_at}` : ''}`}
        />

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
              STOREFRONT PROFILE
            </Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
              Seller-facing storefront settings
            </Text>
            <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
              Save slug, title, tagline, description, theme, and enabled state with the mobile storefront API.
            </Text>
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
            description="Logo/header upload API is now available and can be connected in the next settings pass."
          />

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
