import { Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button, InlineError, Screen, SectionCard, TextField } from '@/src/components/ui';
import { useAuth } from '@/src/lib/auth/auth-provider';
import {
  manualProductStatusOptions,
} from '@/src/features/products/review-form';
import {
  imageKindCounts,
  processingBannerDescription,
  processingHeadline,
  productPriceLabel,
  productStatusLabel,
  productSubtitle,
  shouldPollProductDetail,
} from '@/src/features/products/helpers';
import { useProductDetail } from '@/src/features/products/use-product-detail';
import { useProductReviewForm } from '@/src/features/products/use-product-review-form';
import { useProductTabs } from '@/src/features/products/use-product-tabs';
import { colors } from '@/src/theme/colors';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useAuth();

  const productId = Number(id);

  const { product, isLoading, isPolling, error, refresh, saveProduct } = useProductDetail(
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
    isSaving,
    error: reviewError,
    updateField,
    reset,
    save,
  } = useProductReviewForm({
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
            This is the first mobile product detail view powered by `GET /api/v1/products/:id`.
            It shows AI summary, pricing, listings, processing state, and image counts from the real
            backend response.
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
                    value={draft.title}
                    onChangeText={(value) => {
                      updateField('title', value);
                    }}
                  />
                  <TextField
                    label="Brand"
                    value={draft.brand}
                    onChangeText={(value) => {
                      updateField('brand', value);
                    }}
                  />
                  <TextField
                    label="Category"
                    value={draft.category}
                    onChangeText={(value) => {
                      updateField('category', value);
                    }}
                  />
                  <TextField
                    label="Condition"
                    value={draft.condition}
                    onChangeText={(value) => {
                      updateField('condition', value);
                    }}
                  />
                  <TextField
                    label="Color"
                    value={draft.color}
                    onChangeText={(value) => {
                      updateField('color', value);
                    }}
                  />
                  <TextField
                    label="Size"
                    value={draft.size}
                    onChangeText={(value) => {
                      updateField('size', value);
                    }}
                  />
                  <TextField
                    label="Material"
                    value={draft.material}
                    onChangeText={(value) => {
                      updateField('material', value);
                    }}
                  />
                  <TextField
                    label="Price"
                    keyboardType="decimal-pad"
                    value={draft.price}
                    onChangeText={(value) => {
                      updateField('price', value);
                    }}
                  />
                  <TextField
                    label="Cost"
                    keyboardType="decimal-pad"
                    value={draft.cost}
                    onChangeText={(value) => {
                      updateField('cost', value);
                    }}
                  />
                  <TextField
                    label="SKU"
                    value={draft.sku}
                    onChangeText={(value) => {
                      updateField('sku', value);
                    }}
                  />
                  <TextField
                    label="Tags (comma-separated)"
                    value={draft.tagsText}
                    onChangeText={(value) => {
                      updateField('tagsText', value);
                    }}
                  />
                  <TextField
                    label="Notes"
                    multiline
                    numberOfLines={4}
                    style={{ minHeight: 110, paddingVertical: 14, textAlignVertical: 'top' }}
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
                        label={isSaving ? 'Saving changes...' : 'Save changes'}
                        disabled={!isDirty || isSaving}
                        onPress={() => {
                          void save();
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        label="Reset"
                        kind="secondary"
                        disabled={!isDirty || isSaving}
                        onPress={reset}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <Text style={{ color: colors.mutedText, fontSize: 14 }}>Preparing review fields...</Text>
              )}
            </View>

            <SectionCard
              eyebrow="AI Summary"
              title={product.ai_summary ?? 'No AI summary yet'}
              description={
                product.description_draft?.short_description ??
                'Description draft content will expand in the next review-focused step.'
              }
            />

            <SectionCard
              eyebrow="Pricing"
              title={
                product.price_research?.suggested_target_price
                  ? `$${product.price_research.suggested_target_price} target`
                  : 'No price research yet'
              }
              description={
                product.price_research?.rationale_summary ??
                'Pricing rationale will appear here when the backend has completed research.'
              }
            />

            <SectionCard
              eyebrow="Images"
              title={`${product.images.length} image records`}
              description={`Originals: ${imageCounts.original ?? 0} · Background removed: ${imageCounts.background_removed ?? 0} · Lifestyle: ${imageCounts.lifestyle_generated ?? 0}`}
            />

            <SectionCard
              eyebrow="Marketplaces"
              title={`${product.marketplace_listings.length} generated listing${product.marketplace_listings.length === 1 ? '' : 's'}`}
              description={
                product.marketplace_listings[0]
                  ? `${product.marketplace_listings[0].marketplace}: ${product.marketplace_listings[0].generated_title ?? 'Generated'}`
                  : 'No marketplace listings have been generated yet.'
              }
            />

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
    </Screen>
  );
}
