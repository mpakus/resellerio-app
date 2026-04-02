import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useState, type PropsWithChildren } from 'react';
import { Linking, Modal, Pressable, ScrollView, Share, Text, View } from 'react-native';

import { Button, DialogModal, InlineError, Screen, SectionCard, TextField } from '@/src/components/ui';
import { useAuth } from '@/src/lib/auth/auth-provider';
import { manualProductStatusOptions } from '@/src/features/products/review-form';
import {
  buildStorefrontProductUrl,
  buildReorderedStorefrontImageIds,
  collectLifestyleSceneKeys,
  filterRenderableImages,
  formatImageKindLabel,
  formatConfidenceScore,
  formatCurrencyAmount,
  formatMarketplaceName,
  formatProductDetailTimestamp,
  humanizeSceneKey,
  imageKindCounts,
  marketplaceListingHeadline,
  processingBannerDescription,
  processingHeadline,
  productPriceLabel,
  productStatusLabel,
  productSubtitle,
  sortStorefrontImages,
  storefrontPublicationSummary,
  storefrontSelectionCount,
  shouldPollProductDetail,
} from '@/src/features/products/helpers';
import { useProductPublicationForm } from '@/src/features/products/use-product-publication-form';
import { useProductDetail } from '@/src/features/products/use-product-detail';
import { useProductReviewForm } from '@/src/features/products/use-product-review-form';
import { useProductTabs } from '@/src/features/products/use-product-tabs';
import type { ProductImage } from '@/src/features/products/types';
import { colors } from '@/src/theme/colors';

type DetailPanelProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description?: string;
}>;

function DetailPanel({ eyebrow, title, description, children }: DetailPanelProps) {
  return (
    <View
      style={{
        gap: 14,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        padding: 18,
      }}
    >
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
          {eyebrow.toUpperCase()}
        </Text>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{title}</Text>
        {description ? (
          <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>{description}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function DetailMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.mutedText, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{value}</Text>
    </View>
  );
}

function ImagePreviewCard({
  image,
  onPreview,
}: {
  image: ProductImage;
  onPreview: (image: ProductImage) => void;
}) {
  if (!image.url) {
    return null;
  }

  return (
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
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          onPreview(image);
        }}
        style={{ gap: 10 }}
      >
        <Image
          source={image.url}
          style={{ height: 220, width: '100%', borderRadius: 14, backgroundColor: colors.card }}
          contentFit="cover"
        />
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
          {formatImageKindLabel(image.kind)} · #{image.id}
        </Text>
      </Pressable>
      <DetailMetaRow label="Filename" value={image.original_filename ?? image.storage_key} />
      <DetailMetaRow
        label="Size"
        value={image.width && image.height ? `${image.width}x${image.height}` : 'Unknown size'}
      />
      <Button
        label="Preview full screen"
        kind="secondary"
        onPress={() => {
          onPreview(image);
        }}
      />
    </View>
  );
}

function ImageLightbox({
  image,
  visible,
  onClose,
}: {
  image: ProductImage | null;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal animationType="fade" transparent={false} visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#0b0d12', paddingHorizontal: 18, paddingVertical: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: '#f7f8fb', fontSize: 20, fontWeight: '800' }}>
              {image ? `${formatImageKindLabel(image.kind)} · #${image.id}` : 'Image preview'}
            </Text>
            <Text style={{ color: '#b1b8c5', fontSize: 14 }}>
              {image ? image.original_filename ?? image.storage_key : 'No image selected'}
            </Text>
          </View>
          <View style={{ width: 108 }}>
            <Button label="Close" kind="secondary" onPress={onClose} />
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 18 }}>
          {image?.url ? (
            <Image
              source={image.url}
              style={{ flex: 1, width: '100%' }}
              contentFit="contain"
            />
          ) : (
            <Text style={{ color: '#b1b8c5', fontSize: 15 }}>This image is not available for preview.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function ProductDetailScreen() {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useAuth();

  const productId = Number(id);

  const {
    product,
    storefrontSlug,
    isLoading,
    isLoadingLifestyleRuns,
    isPolling,
    error,
    lifestyleRuns,
    lifestyleRunsError,
    refresh,
    generateLifestyle,
    saveProduct,
    isReprocessing,
    isUpdatingLifecycle,
    isGeneratingLifestyle,
    isUpdatingMedia,
    isDeleting,
    retryProcessing,
    markSold,
    archive,
    unarchive,
    removeProduct,
    approveLifestyleImage,
    deleteLifestyleImage,
    setImageStorefrontVisibility,
    saveStorefrontImageOrder,
  } = useProductDetail(
    session.token,
    Number.isFinite(productId) ? productId : 0,
  );
  const {
    productTabs,
    isLoading: isLoadingProductTabs,
    error: productTabsError,
  } = useProductTabs(session.token);
  const {
    draft,
    isDirty,
    isSaving: isReviewSaving,
    error: reviewError,
    updateField,
    reset,
    save,
  } = useProductReviewForm({
    product,
    onSave: saveProduct,
  });
  const {
    draft: publicationDraft,
    isDirty: isPublicationDirty,
    isSaving: isPublicationSaving,
    error: publicationError,
    updateStorefrontEnabled,
    updateMarketplaceUrl,
    reset: resetPublication,
    save: savePublication,
  } = useProductPublicationForm({
    product,
    onSave: saveProduct,
  });

  if (!Number.isFinite(productId) || productId <= 0) {
    return (
      <Screen contentContainerStyle={{ justifyContent: 'center' }}>
        <InlineError message="Invalid product ID." />
      </Screen>
    );
  }

  const imageCounts = imageKindCounts(product?.images ?? []);
  const isLifecycleBusy = isReprocessing || isUpdatingLifecycle || isDeleting || isReviewSaving;
  const readyImages = (product?.images ?? []).filter((image) => image.processing_status === 'ready');
  const storefrontImages = sortStorefrontImages(product?.images ?? []);
  const availableStorefrontImages = readyImages.filter((image) => !image.storefront_visible);
  const lifestyleImages = readyImages.filter((image) => image.kind === 'lifestyle_generated');
  const lifestyleSceneKeys = collectLifestyleSceneKeys(lifestyleImages);
  const originalImages = filterRenderableImages(product?.images ?? [], 'original');
  const backgroundRemovedImages = filterRenderableImages(product?.images ?? [], 'background_removed');
  const publicProductUrl = product ? buildStorefrontProductUrl(storefrontSlug, product) : null;
  const canSharePublicProduct = Boolean(publicProductUrl && product?.storefront_published_at);

  async function handleShareUrl(url: string) {
    await Share.share({
      message: url,
      url,
    });
  }

  async function handleDelete() {
    const deleted = await removeProduct();

    if (!deleted) {
      return;
    }

    setDeleteModalVisible(false);
    router.replace('/products');
  }

  async function handleMoveStorefrontImage(imageId: number, direction: 'earlier' | 'later') {
    const reorderedIds = buildReorderedStorefrontImageIds(
      storefrontImages.map((image) => image.id),
      imageId,
      direction,
    );

    await saveStorefrontImageOrder(reorderedIds);
  }

  return (
    <Screen scrollable>
      <Stack.Screen options={{ title: product?.title ?? 'Product' }} />

      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>
            PRODUCT DETAIL
          </Text>
          <Text style={{ color: colors.text, fontSize: 31, fontWeight: '800', letterSpacing: -0.8 }}>
            {product?.title ?? 'Loading product'}
          </Text>
          <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
            Review product data, monitor AI processing, and manage the seller workflow from the same
            live mobile API payload the web workspace uses.
          </Text>
        </View>

        <Button label="Refresh detail" kind="secondary" onPress={refresh} />

        {error ? <InlineError message={error} /> : null}

        {isLoading ? (
          <Text style={{ color: colors.mutedText, fontSize: 15 }}>Loading product detail...</Text>
        ) : null}

        {product ? (
          <>
            {shouldPollProductDetail(product) ? (
              <View
                style={{
                  gap: 8,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  backgroundColor: colors.accentSoft,
                  padding: 18,
                }}
              >
                <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
                  PROCESSING ACTIVE
                </Text>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                  {isPolling ? 'Auto-refreshing while AI work finishes' : 'Processing update pending'}
                </Text>
                <Text style={{ color: colors.mutedText, fontSize: 15, lineHeight: 23 }}>
                  {processingBannerDescription(product)}
                </Text>
              </View>
            ) : null}

            <SectionCard
              eyebrow="Status"
              title={`${productStatusLabel(product.status)} · ${productPriceLabel(product.price)}`}
              description={productSubtitle(product) || 'No brand or category yet'}
            />

            <SectionCard
              eyebrow="Processing"
              title={processingHeadline(product)}
              description={
                product.latest_processing_run?.error_message ??
                'The latest processing run state is shown here while we build the richer review UI.'
              }
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
                  REVIEW EDITOR
                </Text>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                  Seller-managed product fields
                </Text>
                <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
                  Edit the same core review fields the web workspace saves through `PATCH /api/v1/products/:id`.
                </Text>
              </View>

              {reviewError ? <InlineError message={reviewError} /> : null}
              {productTabsError ? <InlineError message={productTabsError} /> : null}

              {draft ? (
                <>
                  <TextField
                    label="Title"
                    copyable
                    value={draft.title}
                    onChangeText={(value) => {
                      updateField('title', value);
                    }}
                  />
                  <TextField
                    label="Brand"
                    copyable
                    value={draft.brand}
                    onChangeText={(value) => {
                      updateField('brand', value);
                    }}
                  />
                  <TextField
                    label="Category"
                    copyable
                    value={draft.category}
                    onChangeText={(value) => {
                      updateField('category', value);
                    }}
                  />
                  <TextField
                    label="Condition"
                    copyable
                    value={draft.condition}
                    onChangeText={(value) => {
                      updateField('condition', value);
                    }}
                  />
                  <TextField
                    label="Color"
                    copyable
                    value={draft.color}
                    onChangeText={(value) => {
                      updateField('color', value);
                    }}
                  />
                  <TextField
                    label="Size"
                    copyable
                    value={draft.size}
                    onChangeText={(value) => {
                      updateField('size', value);
                    }}
                  />
                  <TextField
                    label="Material"
                    copyable
                    value={draft.material}
                    onChangeText={(value) => {
                      updateField('material', value);
                    }}
                  />
                  <TextField
                    label="Price"
                    copyable
                    keyboardType="decimal-pad"
                    value={draft.price}
                    onChangeText={(value) => {
                      updateField('price', value);
                    }}
                  />
                  <TextField
                    label="Cost"
                    copyable
                    keyboardType="decimal-pad"
                    value={draft.cost}
                    onChangeText={(value) => {
                      updateField('cost', value);
                    }}
                  />
                  <TextField
                    label="SKU"
                    copyable
                    value={draft.sku}
                    onChangeText={(value) => {
                      updateField('sku', value);
                    }}
                  />
                  <TextField
                    label="Tags (comma-separated)"
                    copyable
                    value={draft.tagsText}
                    onChangeText={(value) => {
                      updateField('tagsText', value);
                    }}
                  />
                  <TextField
                    label="Notes"
                    copyable
                    multiline
                    numberOfLines={4}
                    value={draft.notes}
                    onChangeText={(value) => {
                      updateField('notes', value);
                    }}
                  />

                  <View style={{ gap: 10 }}>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>Status</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        {manualProductStatusOptions.map((option) => {
                          const isActive = draft.status === option.value;

                          return (
                            <Pressable
                              key={option.value}
                              onPress={() => {
                                updateField('status', option.value);
                              }}
                              style={{
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: isActive ? colors.accent : colors.border,
                                backgroundColor: isActive ? colors.accentSoft : colors.background,
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
                    </ScrollView>
                  </View>

                  <View style={{ gap: 10 }}>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>Product tab</Text>
                    {isLoadingProductTabs ? (
                      <Text style={{ color: colors.mutedText, fontSize: 14 }}>Loading tabs...</Text>
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <Pressable
                            onPress={() => {
                              updateField('productTabId', null);
                            }}
                            style={{
                              borderRadius: 999,
                              borderWidth: 1,
                              borderColor: draft.productTabId === null ? colors.accent : colors.border,
                              backgroundColor: draft.productTabId === null ? colors.accentSoft : colors.background,
                              paddingHorizontal: 14,
                              paddingVertical: 10,
                            }}
                          >
                            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>No tab</Text>
                          </Pressable>
                          {productTabs.map((tab) => {
                            const isActive = draft.productTabId === tab.id;

                            return (
                              <Pressable
                                key={tab.id}
                                onPress={() => {
                                  updateField('productTabId', tab.id);
                                }}
                                style={{
                                  borderRadius: 999,
                                  borderWidth: 1,
                                  borderColor: isActive ? colors.accent : colors.border,
                                  backgroundColor: isActive ? colors.accentSoft : colors.background,
                                  paddingHorizontal: 14,
                                  paddingVertical: 10,
                                }}
                              >
                                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                                  {tab.name}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </ScrollView>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        label={isReviewSaving ? 'Saving changes...' : 'Save changes'}
                        disabled={!isDirty || isReviewSaving}
                        onPress={() => {
                          void save();
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        label="Reset"
                        kind="secondary"
                        disabled={!isDirty || isReviewSaving}
                        onPress={reset}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <Text style={{ color: colors.mutedText, fontSize: 14 }}>Preparing review fields...</Text>
              )}
            </View>

            <View
              style={{
                gap: 14,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 18,
              }}
            >
              <View style={{ gap: 6 }}>
                <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
                  LIFECYCLE
                </Text>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                  Quick product actions
                </Text>
                <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
                  Use the same mobile API lifecycle actions the web workspace uses for retry, sold, archive, restore, and delete flows.
                </Text>
              </View>

              {product.images.length > 0 ? (
                <Button
                  label={isReprocessing ? (product.status === 'processing' ? 'Resuming processing...' : 'Retrying AI...') : product.status === 'processing' ? 'Resume processing' : 'Retry AI'}
                  kind="secondary"
                  disabled={isLifecycleBusy}
                  onPress={() => {
                    void retryProcessing();
                  }}
                />
              ) : null}

              {product.status !== 'sold' ? (
                <Button
                  label="Mark sold"
                  kind="secondary"
                  disabled={isLifecycleBusy}
                  onPress={() => {
                    void markSold();
                  }}
                />
              ) : null}

              {product.status !== 'archived' ? (
                <Button
                  label="Archive"
                  kind="secondary"
                  disabled={isLifecycleBusy}
                  onPress={() => {
                    void archive();
                  }}
                />
              ) : (
                <Button
                  label="Restore"
                  kind="secondary"
                  disabled={isLifecycleBusy}
                  onPress={() => {
                    void unarchive();
                  }}
                />
              )}

              <Button
                label={isDeleting ? 'Deleting product...' : 'Delete product'}
                kind="secondary"
                disabled={isLifecycleBusy}
                onPress={() => {
                  setDeleteModalVisible(true);
                }}
              />
            </View>

            <DetailPanel
              eyebrow="Storefront"
              title={
                product.storefront_enabled
                  ? product.storefront_published_at
                    ? 'Published to storefront'
                    : 'Storefront enabled'
                  : 'Not on storefront'
              }
              description={storefrontPublicationSummary(product)}
            >
              <DetailMetaRow
                label="Publication status"
                value={product.storefront_enabled ? 'Enabled' : 'Disabled'}
              />
              <DetailMetaRow
                label="Published at"
                value={formatProductDetailTimestamp(product.storefront_published_at)}
              />
              <DetailMetaRow
                label="Selected gallery images"
                value={`${storefrontSelectionCount(product.images)} of ${product.images.length}`}
              />
              <DetailMetaRow
                label="Public URL"
                value={
                  publicProductUrl ??
                  'Save a storefront slug in Settings before sharing public product links.'
                }
              />

              {publicationError ? <InlineError message={publicationError} /> : null}

              {publicationDraft ? (
                <>
                  <View style={{ gap: 10 }}>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
                      Storefront visibility
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {[
                        { label: 'Enabled', value: true },
                        { label: 'Disabled', value: false },
                      ].map((option) => {
                        const isActive = publicationDraft.storefrontEnabled === option.value;

                        return (
                          <Pressable
                            key={option.label}
                            onPress={() => {
                              updateStorefrontEnabled(option.value);
                            }}
                            style={{
                              borderRadius: 999,
                              borderWidth: 1,
                              borderColor: isActive ? colors.accent : colors.border,
                              backgroundColor: isActive ? colors.accentSoft : colors.background,
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
                        label={isPublicationSaving ? 'Saving storefront...' : 'Save storefront settings'}
                        disabled={!isPublicationDirty || isPublicationSaving}
                        onPress={() => {
                          void savePublication();
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        label="Reset"
                        kind="secondary"
                        disabled={!isPublicationDirty || isPublicationSaving}
                        onPress={resetPublication}
                      />
                    </View>
                  </View>
                </>
              ) : null}

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Open live page"
                    kind="secondary"
                    disabled={!canSharePublicProduct}
                    onPress={() => {
                      if (publicProductUrl) {
                        void Linking.openURL(publicProductUrl);
                      }
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Share product URL"
                    kind="secondary"
                    disabled={!canSharePublicProduct}
                    onPress={() => {
                      if (publicProductUrl) {
                        void handleShareUrl(publicProductUrl);
                      }
                    }}
                  />
                </View>
              </View>
            </DetailPanel>

            <DetailPanel
              eyebrow="AI Summary"
              title={product.ai_summary ?? 'No AI summary yet'}
              description={
                product.ai_summary
                  ? 'AI summary and confidence are available for quick mobile review.'
                  : 'The backend has not produced a seller-facing AI summary for this product yet.'
              }
            >
              <DetailMetaRow
                label="Confidence"
                value={formatConfidenceScore(product.ai_confidence)}
              />
              <DetailMetaRow
                label="Processing step"
                value={product.latest_processing_run?.step ?? 'Not available'}
              />
              <DetailMetaRow
                label="Latest run"
                value={product.latest_processing_run?.status ?? 'Not available'}
              />
            </DetailPanel>

            <DetailPanel
              eyebrow="Description Draft"
              title={product.description_draft?.suggested_title ?? 'No generated title yet'}
              description={
                product.description_draft?.short_description ??
                'A short resale-ready description will appear here once the draft is generated.'
              }
            >
              <DetailMetaRow
                label="Draft status"
                value={product.description_draft?.status ?? 'Not generated'}
              />
              <DetailMetaRow
                label="Key features"
                value={
                  product.description_draft?.key_features.length
                    ? product.description_draft.key_features.join(', ')
                    : 'No key features yet'
                }
              />
              <DetailMetaRow
                label="SEO keywords"
                value={
                  product.description_draft?.seo_keywords.length
                    ? product.description_draft.seo_keywords.join(', ')
                    : 'No SEO keywords yet'
                }
              />
              {product.description_draft?.missing_details_warning ? (
                <InlineError message={product.description_draft.missing_details_warning} />
              ) : null}
              {product.description_draft?.long_description ? (
                <DetailMetaRow
                  label="Long description"
                  value={product.description_draft.long_description}
                />
              ) : null}
            </DetailPanel>

            <DetailPanel
              eyebrow="Price Research"
              title={
                product.price_research?.suggested_target_price
                  ? `${formatCurrencyAmount(product.price_research.suggested_target_price, product.price_research.currency)} target`
                  : 'No price research yet'
              }
              description={
                product.price_research?.rationale_summary ??
                'Comparable pricing signals will appear here when research has completed.'
              }
            >
              <DetailMetaRow
                label="Target range"
                value={
                  product.price_research
                    ? `${formatCurrencyAmount(product.price_research.suggested_min_price, product.price_research.currency)} to ${formatCurrencyAmount(product.price_research.suggested_max_price, product.price_research.currency)}`
                    : 'Not available'
                }
              />
              <DetailMetaRow
                label="Median"
                value={
                  product.price_research
                    ? formatCurrencyAmount(
                        product.price_research.suggested_median_price,
                        product.price_research.currency,
                      )
                    : 'Not available'
                }
              />
              <DetailMetaRow
                label="Confidence"
                value={
                  product.price_research
                    ? formatConfidenceScore(product.price_research.pricing_confidence)
                    : 'Not available'
                }
              />
              <DetailMetaRow
                label="Market signals"
                value={
                  product.price_research?.market_signals.length
                    ? product.price_research.market_signals.join(', ')
                    : 'No market signals yet'
                }
              />
            </DetailPanel>

            <SectionCard
              eyebrow="Images"
              title={`${product.images.length} image records`}
              description={`Originals: ${imageCounts.original ?? 0} · Background removed: ${imageCounts.background_removed ?? 0} · Lifestyle: ${imageCounts.lifestyle_generated ?? 0}`}
            />

            <DetailPanel
              eyebrow="Original Images"
              title={`${originalImages.length} previewable original${originalImages.length === 1 ? '' : 's'}`}
              description="Tap any original image to open a full-screen preview using the new public image URLs from the mobile API."
            >
              {originalImages.length > 0 ? (
                originalImages.map((image) => (
                  <ImagePreviewCard
                    key={image.id}
                    image={image}
                    onPreview={setSelectedImage}
                  />
                ))
              ) : (
                <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
                  No original images are available for preview yet.
                </Text>
              )}
            </DetailPanel>

            <DetailPanel
              eyebrow="Background Removed"
              title={`${backgroundRemovedImages.length} processed image${backgroundRemovedImages.length === 1 ? '' : 's'}`}
              description="Background-removed images appear here as soon as processing finishes and a public URL is available."
            >
              {backgroundRemovedImages.length > 0 ? (
                backgroundRemovedImages.map((image) => (
                  <ImagePreviewCard
                    key={image.id}
                    image={image}
                    onPreview={setSelectedImage}
                  />
                ))
              ) : (
                <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
                  No background-removed images are ready for preview yet.
                </Text>
              )}
            </DetailPanel>

            <DetailPanel
              eyebrow="Marketplace Listings"
              title={`${product.marketplace_listings.length} generated listing${product.marketplace_listings.length === 1 ? '' : 's'}`}
              description={
                product.marketplace_listings.length > 0
                  ? 'Review generated marketplace copy, pricing suggestions, warnings, and saved live URLs.'
                  : 'No marketplace listings have been generated yet.'
              }
            >
              {product.marketplace_listings.length === 0 ? (
                <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
                  Generate marketplace listings on web or from a later mobile phase to review them here.
                </Text>
              ) : (
                product.marketplace_listings.map((listing) => (
                  <View
                    key={listing.id}
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
                      {marketplaceListingHeadline(listing)}
                    </Text>
                    <DetailMetaRow
                      label="Title"
                      value={listing.generated_title ?? 'No generated title yet'}
                    />
                    <DetailMetaRow
                      label="Suggested price"
                      value={formatCurrencyAmount(listing.generated_price_suggestion)}
                    />
                    <DetailMetaRow
                      label="Live URL"
                      value={listing.external_url ?? 'No live URL saved'}
                    />
                    <DetailMetaRow
                      label="URL added"
                      value={formatProductDetailTimestamp(listing.external_url_added_at)}
                    />
                    <DetailMetaRow
                      label="Tags"
                      value={listing.generated_tags.length ? listing.generated_tags.join(', ') : 'No tags yet'}
                    />
                    <DetailMetaRow
                      label="Warnings"
                      value={
                        listing.compliance_warnings.length
                          ? listing.compliance_warnings.join(', ')
                          : 'No compliance warnings'
                      }
                    />
                    {publicationDraft ? (
                      <>
                        <TextField
                          label={`${formatMarketplaceName(listing.marketplace)} live URL`}
                          copyable
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="url"
                          value={publicationDraft.marketplaceExternalUrls[listing.marketplace] ?? ''}
                          onChangeText={(value) => {
                            updateMarketplaceUrl(listing.marketplace, value);
                          }}
                        />
                        <Button
                          label="Open marketplace URL"
                          kind="secondary"
                          disabled={!(publicationDraft.marketplaceExternalUrls[listing.marketplace] ?? '').trim()}
                          onPress={() => {
                            const liveUrl = publicationDraft.marketplaceExternalUrls[listing.marketplace]?.trim();

                            if (liveUrl) {
                              void Linking.openURL(liveUrl);
                            }
                          }}
                        />
                      </>
                    ) : null}
                  </View>
                ))
              )}
              {product.marketplace_listings.length > 0 && publicationDraft ? (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label={isPublicationSaving ? 'Saving URLs...' : 'Save storefront and URLs'}
                      disabled={!isPublicationDirty || isPublicationSaving}
                      onPress={() => {
                        void savePublication();
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Reset"
                      kind="secondary"
                      disabled={!isPublicationDirty || isPublicationSaving}
                      onPress={resetPublication}
                    />
                  </View>
                </View>
              ) : null}
            </DetailPanel>

            <DetailPanel
              eyebrow="Lifestyle Studio"
              title={
                product.latest_lifestyle_generation_run
                  ? `Latest run · ${product.latest_lifestyle_generation_run.status}`
                  : 'No lifestyle generation yet'
              }
              description="Generate seller-reviewed lifestyle imagery, track run history, and approve the best variants for storefront fallback priority."
            >
              <Button
                label={
                  isGeneratingLifestyle
                    ? 'Generating lifestyle images...'
                    : lifestyleImages.length > 0
                      ? 'Regenerate all scenes'
                      : 'Generate lifestyle images'
                }
                disabled={isGeneratingLifestyle || isUpdatingMedia}
                onPress={() => {
                  void generateLifestyle();
                }}
              />

              {lifestyleRunsError ? <InlineError message={lifestyleRunsError} /> : null}

              <DetailMetaRow
                label="Latest run"
                value={
                  product.latest_lifestyle_generation_run
                    ? `${product.latest_lifestyle_generation_run.status} · ${product.latest_lifestyle_generation_run.completed_count ?? 0}/${product.latest_lifestyle_generation_run.requested_count ?? 0} complete`
                    : 'No lifestyle runs yet'
                }
              />

              <DetailMetaRow
                label="Run history"
                value={
                  isLoadingLifestyleRuns
                    ? 'Loading run history...'
                    : lifestyleRuns.length > 0
                      ? `${lifestyleRuns.length} run${lifestyleRuns.length === 1 ? '' : 's'} available`
                      : 'No run history yet'
                }
              />

              {lifestyleSceneKeys.length > 0 ? (
                <View style={{ gap: 10 }}>
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
                    Scene shortcuts
                  </Text>
                  <View style={{ gap: 10 }}>
                    {lifestyleSceneKeys.map((sceneKey) => (
                      <Button
                        key={sceneKey}
                        label={`Regenerate ${humanizeSceneKey(sceneKey)}`}
                        kind="secondary"
                        disabled={isGeneratingLifestyle || isUpdatingMedia}
                        onPress={() => {
                          void generateLifestyle(sceneKey);
                        }}
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              {lifestyleRuns.map((run) => (
                <View
                  key={run.id}
                  style={{
                    gap: 8,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    padding: 14,
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                    Run #{run.id} · {run.status}
                  </Text>
                  <DetailMetaRow label="Step" value={run.step ?? 'Not available'} />
                  <DetailMetaRow label="Scene family" value={run.scene_family ?? 'Default set'} />
                  <DetailMetaRow
                    label="Counts"
                    value={`${run.completed_count ?? 0}/${run.requested_count ?? 0} complete`}
                  />
                </View>
              ))}

              {lifestyleImages.length > 0 ? (
                lifestyleImages.map((image) => (
                  <View
                    key={image.id}
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
                      Lifestyle image #{image.id}
                    </Text>
                    <DetailMetaRow label="Scene" value={image.scene_key ?? 'Default scene'} />
                    <DetailMetaRow
                      label="Approved"
                      value={image.seller_approved ? `Yes · ${formatProductDetailTimestamp(image.approved_at)}` : 'No'}
                    />
                    <DetailMetaRow
                      label="Source images"
                      value={image.source_image_ids.length > 0 ? image.source_image_ids.join(', ') : 'Not available'}
                    />
                    {image.url ? (
                      <Button
                        label="Preview full screen"
                        kind="secondary"
                        disabled={isUpdatingMedia}
                        onPress={() => {
                          setSelectedImage(image);
                        }}
                        />
                    ) : null}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {image.scene_key ? (
                        <View style={{ flex: 1 }}>
                          <Button
                            label="Regenerate scene"
                            kind="secondary"
                            disabled={isGeneratingLifestyle || isUpdatingMedia}
                            onPress={() => {
                              void generateLifestyle(image.scene_key ?? undefined);
                            }}
                          />
                        </View>
                      ) : null}
                      {!image.seller_approved ? (
                        <View style={{ flex: 1 }}>
                          <Button
                            label="Approve"
                            kind="secondary"
                            disabled={isUpdatingMedia}
                            onPress={() => {
                              void approveLifestyleImage(image.id);
                            }}
                          />
                        </View>
                      ) : null}
                      <View style={{ flex: 1 }}>
                        <Button
                          label="Delete"
                          kind="secondary"
                          disabled={isUpdatingMedia}
                          onPress={() => {
                            void deleteLifestyleImage(image.id);
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
                  No lifestyle-generated images yet. Generate a run after AI review is ready.
                </Text>
              )}
            </DetailPanel>

            <DetailPanel
              eyebrow="Storefront Gallery"
              title={`${storefrontImages.length} selected image${storefrontImages.length === 1 ? '' : 's'}`}
              description="Choose which ready images should appear in the storefront gallery and reorder the selected set."
            >
              <DetailMetaRow
                label="Selected"
                value={
                  storefrontImages.length > 0
                    ? storefrontImages.map((image) => `#${image.id}`).join(', ')
                    : 'No images explicitly selected'
                }
              />
              <DetailMetaRow
                label="Fallback"
                value="When no image is selected, the storefront falls back to approved lifestyle, then background-removed, then original images."
              />

              {storefrontImages.length > 0 ? (
                storefrontImages.map((image, index) => (
                  <View
                    key={image.id}
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
                      {image.kind} · #{image.id}
                    </Text>
                    <DetailMetaRow
                      label="Position"
                      value={`Storefront ${image.storefront_position ?? index + 1} · Upload ${image.position ?? 'n/a'}`}
                    />
                    <DetailMetaRow
                      label="Filename"
                      value={image.original_filename ?? image.storage_key}
                    />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Button
                          label="Move earlier"
                          kind="secondary"
                          disabled={isUpdatingMedia || index === 0}
                          onPress={() => {
                            void handleMoveStorefrontImage(image.id, 'earlier');
                          }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button
                          label="Move later"
                          kind="secondary"
                          disabled={isUpdatingMedia || index === storefrontImages.length - 1}
                          onPress={() => {
                            void handleMoveStorefrontImage(image.id, 'later');
                          }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button
                          label="Hide"
                          kind="secondary"
                          disabled={isUpdatingMedia}
                          onPress={() => {
                            void setImageStorefrontVisibility(image.id, false, null);
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ))
              ) : null}

              {availableStorefrontImages.length > 0 ? (
                availableStorefrontImages.map((image) => (
                  <View
                    key={image.id}
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
                      {image.kind} · #{image.id}
                    </Text>
                    <DetailMetaRow
                      label="Filename"
                      value={image.original_filename ?? image.storage_key}
                    />
                    <DetailMetaRow
                      label="Ready for storefront"
                      value={image.processing_status === 'ready' ? 'Yes' : 'No'}
                    />
                    <Button
                      label="Add to storefront"
                      kind="secondary"
                      disabled={isUpdatingMedia}
                      onPress={() => {
                        void setImageStorefrontVisibility(
                          image.id,
                          true,
                          storefrontImages.length + 1,
                        );
                      }}
                    />
                  </View>
                ))
              ) : (
                <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
                  All ready images are already selected for storefront, or the product has no ready images yet.
                </Text>
              )}
            </DetailPanel>

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
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
                Product fields snapshot
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
                Condition: {product.condition ?? 'Not set'}{'\n'}
                Color: {product.color ?? 'Not set'}{'\n'}
                Size: {product.size ?? 'Not set'}{'\n'}
                Material: {product.material ?? 'Not set'}{'\n'}
                SKU: {product.sku ?? 'Not set'}{'\n'}
                Tags: {product.tags.length > 0 ? product.tags.join(', ') : 'No tags'}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      <DialogModal
        visible={deleteModalVisible}
        title="Delete this product?"
        description="This permanently removes the product, images, AI metadata, listings, and processing history."
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalVisible(false);
          }
        }}
      >
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={isDeleting ? 'Deleting...' : 'Delete forever'}
              disabled={isDeleting}
              onPress={() => {
                void handleDelete();
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Cancel"
              kind="secondary"
              disabled={isDeleting}
              onPress={() => {
                setDeleteModalVisible(false);
              }}
            />
          </View>
        </View>
        </DialogModal>

      <ImageLightbox
        image={selectedImage}
        visible={selectedImage !== null}
        onClose={() => {
          setSelectedImage(null);
        }}
      />
    </Screen>
  );
}
