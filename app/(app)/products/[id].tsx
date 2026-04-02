import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, InlineError, Screen, SectionCard } from '@/src/components/ui';
import { useAuth } from '@/src/lib/auth/auth-provider';
import {
  imageKindCounts,
  processingHeadline,
  productPriceLabel,
  productStatusLabel,
  productSubtitle,
} from '@/src/features/products/helpers';
import { useProductDetail } from '@/src/features/products/use-product-detail';
import { colors } from '@/src/theme/colors';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useAuth();

  const productId = Number(id);

  const { product, isLoading, error, refresh } = useProductDetail(
    session.token,
    Number.isFinite(productId) ? productId : 0,
  );

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
