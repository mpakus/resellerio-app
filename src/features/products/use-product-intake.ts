import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { formatApiError } from '@/src/lib/api/client';
import {
  createAndUploadProduct,
  ProductUploadError,
  type IntakeAsset,
} from '@/src/features/products/intake';
import type { ProductDetail, ProductTab } from '@/src/features/products/types';

export type IntakeQueueStatus = 'queued' | 'uploading' | 'uploaded' | 'failed';

export type IntakeQueueItem = {
  asset: IntakeAsset;
  status: IntakeQueueStatus;
  error: string | null;
};

export function useProductIntake(token: string, productTabs: ProductTab[]) {
  const [queueItems, setQueueItems] = useState<IntakeQueueItem[]>([]);
  const [selectedProductTabId, setSelectedProductTabId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProductTab = useMemo(
    () => productTabs.find((tab) => tab.id === selectedProductTabId) ?? null,
    [productTabs, selectedProductTabId],
  );
  const assets = useMemo(() => queueItems.map((item) => item.asset), [queueItems]);
  const progress = useMemo(() => {
    return queueItems.reduce(
      (counts, item) => {
        counts[item.status] += 1;
        return counts;
      },
      { queued: 0, uploading: 0, uploaded: 0, failed: 0 },
    );
  }, [queueItems]);
  const hasFailedUploads = progress.failed > 0;

  function appendAssets(pickedAssets: IntakeAsset[]) {
    setError(null);
    setQueueItems((current) => [...current, ...pickedAssets.map(appendQueueItem)].slice(0, 10));
  }

  async function pickImages() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Photo library permission is required to pick product images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10,
    });

    if (result.canceled) {
      return;
    }

    appendAssets(result.assets);
  }

  async function captureImage() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setError('Camera permission is required to capture product images.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    appendAssets(result.assets);
  }

  function removeAsset(uri: string) {
    setQueueItems((current) => current.filter((item) => item.asset.uri !== uri));
  }

  function resetIntake() {
    setError(null);
    setQueueItems([]);
  }

  async function submit() {
    if (assets.length === 0) {
      setError('Choose at least one image to start a new product.');
      return null;
    }

    setIsSubmitting(true);
    setError(null);
    setQueueItems((current) =>
      current.map((item) => ({
        ...item,
        status: 'queued',
        error: null,
      })),
    );

    try {
      const result = await createAndUploadProduct({
        token,
        assets,
        productTab: selectedProductTab,
        onUploadStart: (_asset, index) => {
          setQueueItems((current) => updateQueueItem(current, index, { status: 'uploading', error: null }));
        },
        onUploadComplete: (_asset, index) => {
          setQueueItems((current) => updateQueueItem(current, index, { status: 'uploaded', error: null }));
        },
      });

      return result.finalizeResponse.data.product as ProductDetail;
    } catch (submitError) {
      if (submitError instanceof ProductUploadError) {
        setQueueItems((current) =>
          updateQueueItem(current, submitError.index, {
            status: 'failed',
            error: submitError.message,
          }),
        );
        setError(`${submitError.message} Retry upload or start over.`);
        return null;
      }

      setError(formatApiError(submitError));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    assets,
    queueItems,
    selectedProductTabId,
    setSelectedProductTabId,
    selectedProductTab,
    isSubmitting,
    error,
    progress,
    hasFailedUploads,
    pickImages,
    captureImage,
    removeAsset,
    resetIntake,
    submit,
  };
}

function appendQueueItem(asset: IntakeAsset): IntakeQueueItem {
  return {
    asset,
    status: 'queued',
    error: null,
  };
}

function updateQueueItem(
  items: IntakeQueueItem[],
  index: number,
  patch: Partial<Pick<IntakeQueueItem, 'status' | 'error'>>,
) {
  return items.map((item, itemIndex) => {
    if (itemIndex !== index) {
      return item;
    }

    return {
      ...item,
      ...patch,
    };
  });
}
