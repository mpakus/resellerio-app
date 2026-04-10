import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { BrandedTitle, Button, InlineError, Screen } from '@/src/components/ui';
import { useAuth } from '@/src/lib/auth/auth-provider';
import { useProductsOverview } from '@/src/features/products/use-products-overview';
import { useProductIntake } from '@/src/features/products/use-product-intake';
import { colors } from '@/src/theme/colors';

export default function NewProductScreen() {
  const { session } = useAuth();
  const { productTabs } = useProductsOverview(session.token);
  const {
    queueItems,
    selectedProductTabId,
    setSelectedProductTabId,
    isSubmitting,
    error,
    progress,
    hasFailedUploads,
    pickImages,
    captureImage,
    removeAsset,
    resetIntake,
    submit,
  } = useProductIntake(session.token, productTabs);
  const totalAssets = queueItems.length;
  const uploadSummaryLabel = isSubmitting
    ? `Uploading ${progress.uploaded + progress.uploading} of ${totalAssets}`
    : `${totalAssets} selected · ${progress.uploaded} uploaded · ${progress.failed} failed`;

  async function handleSubmit() {
    const product = await submit();

    if (product) {
      router.replace(`/products/${product.id}`);
    }
  }

  return (
    <Screen includeBottomInset={false} includeTopInset={false} scrollable>
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>
            NEW PRODUCT
          </Text>
          <BrandedTitle title="Start with photos" />
          <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
            Select product images first, upload them with signed URLs, finalize, then land in
            product detail while AI processing starts.
          </Text>
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
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Add images</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Pick Photos"
                disabled={isSubmitting}
                onPress={() => {
                  void pickImages();
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Use Camera"
                kind="secondary"
                disabled={isSubmitting}
                onPress={() => {
                  void captureImage();
                }}
              />
            </View>
          </View>
          <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
            Up to 3 images. We use image width, height, and byte size from the picker metadata for
            upload finalization.
          </Text>
        </View>

        {totalAssets > 0 ? (
          <View
            style={{
              gap: 8,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 18,
            }}
          >
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
              UPLOAD QUEUE
            </Text>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
              {uploadSummaryLabel}
            </Text>
            <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
              {hasFailedUploads
                ? 'A failed file can be retried with the same selected photos, or you can start over with a fresh queue.'
                : 'Uploads run in order so we can finalize the product as soon as every original image reaches storage.'}
            </Text>
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
            OPTIONAL TAB
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <Button
              label="No Tab"
              kind={selectedProductTabId === null ? 'primary' : 'secondary'}
              onPress={() => {
                setSelectedProductTabId(null);
              }}
            />
            {productTabs.map((tab) => (
              <Button
                key={tab.id}
                label={tab.name}
                kind={selectedProductTabId === tab.id ? 'primary' : 'secondary'}
                onPress={() => {
                  setSelectedProductTabId(tab.id);
                }}
              />
            ))}
          </View>
        </View>

        {error ? <InlineError message={error} /> : null}

        <View style={{ gap: 12 }}>
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
            SELECTED IMAGES
          </Text>

          {queueItems.length === 0 ? (
            <View
              style={{
                borderRadius: 24,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 20,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
                No images selected yet
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: 15, lineHeight: 23, marginTop: 8 }}>
                Pick photos from the library or capture them with the camera to start a new product.
              </Text>
            </View>
          ) : null}

          {queueItems.map((item, index) => (
            <View
              key={item.asset.uri}
              style={{
                gap: 12,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 18,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <Image
                  source={{ uri: item.asset.uri }}
                  style={{ width: 88, height: 88, borderRadius: 18, backgroundColor: colors.accentSoft }}
                  contentFit="cover"
                />
                <View style={{ flex: 1, gap: 6 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>
                      {item.asset.fileName ?? `Photo ${index + 1}`}
                    </Text>
                    <View
                      style={{
                        borderRadius: 999,
                        backgroundColor: statusBackgroundColor(item.status),
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ color: statusTextColor(item.status), fontSize: 12, fontWeight: '700' }}>
                        {statusLabel(item.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.mutedText, fontSize: 14 }}>
                    {item.asset.width}x{item.asset.height} · {item.asset.fileSize ?? 0} bytes
                  </Text>
                  <Text style={{ color: colors.mutedText, fontSize: 14 }}>
                    {item.asset.mimeType ?? 'image/jpeg'}
                  </Text>
                  {item.error ? (
                    <Text style={{ color: colors.danger, fontSize: 14, lineHeight: 21 }}>{item.error}</Text>
                  ) : null}
                </View>
              </View>

              <Button
                label="Remove"
                kind="secondary"
                disabled={isSubmitting}
                onPress={() => {
                  removeAsset(item.asset.uri);
                }}
              />
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={hasFailedUploads ? 'Start over' : 'Back'}
              kind="secondary"
              onPress={() => {
                if (hasFailedUploads) {
                  resetIntake();
                  return;
                }

                router.back();
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label={
                isSubmitting
                  ? `Uploading ${progress.uploaded + progress.uploading}/${Math.max(totalAssets, 1)}`
                  : hasFailedUploads
                    ? 'Retry upload'
                    : 'Create'
              }
              disabled={isSubmitting}
              onPress={() => {
                void handleSubmit();
              }}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

function statusLabel(status: 'queued' | 'uploading' | 'uploaded' | 'failed') {
  switch (status) {
    case 'uploading':
      return 'Uploading';
    case 'uploaded':
      return 'Uploaded';
    case 'failed':
      return 'Failed';
    case 'queued':
    default:
      return 'Queued';
  }
}

function statusBackgroundColor(status: 'queued' | 'uploading' | 'uploaded' | 'failed') {
  switch (status) {
    case 'uploading':
      return '#fff3da';
    case 'uploaded':
      return '#e4f6ea';
    case 'failed':
      return '#fde7df';
    case 'queued':
    default:
      return colors.accentSoft;
  }
}

function statusTextColor(status: 'queued' | 'uploading' | 'uploaded' | 'failed') {
  switch (status) {
    case 'uploading':
      return '#875b00';
    case 'uploaded':
      return '#1f6d38';
    case 'failed':
      return colors.danger;
    case 'queued':
    default:
      return colors.accent;
  }
}
