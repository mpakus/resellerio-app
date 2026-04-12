import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { formatApiError } from '@/src/lib/api/client';
import type { PublicId } from '@/src/lib/api/types';
import {
  createAndUploadProduct,
  MAX_INTAKE_IMAGES,
  optimizeIntakeAsset,
  ProductUploadError,
  type IntakeAsset,
} from '@/src/features/products/intake';
import type { ProductDetail, ProductTab } from '@/src/features/products/types';

export type IntakeQueueStatus = 'resizing' | 'queued' | 'uploading' | 'uploaded' | 'failed';

export type IntakeQueueItem = {
  asset: IntakeAsset;
  status: IntakeQueueStatus;
  error: string | null;
};

export type ResizeProgress = {
  completed: number;
  currentFileName: string | null;
  total: number;
};

export function useProductIntake(token: string, productTabs: ProductTab[]) {
  const [queueItems, setQueueItems] = useState<IntakeQueueItem[]>([]);
  const [selectedProductTabId, setSelectedProductTabId] = useState<PublicId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingAssets, setIsPreparingAssets] = useState(false);
  const [resizeProgress, setResizeProgress] = useState<ResizeProgress>({
    completed: 0,
    currentFileName: null,
    total: 0,
  });
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
      { resizing: 0, queued: 0, uploading: 0, uploaded: 0, failed: 0 },
    );
  }, [queueItems]);
  const hasFailedUploads = progress.failed > 0;
  const remainingSlots = Math.max(0, MAX_INTAKE_IMAGES - queueItems.length);

  async function appendAssets(pickedAssets: IntakeAsset[]) {
    if (isPreparingAssets || isSubmitting) {
      return;
    }

    setError(null);

    if (remainingSlots === 0) {
      setError(`You can add up to ${MAX_INTAKE_IMAGES} images per product.`);
      return;
    }

    const nextAssets = pickedAssets.slice(0, remainingSlots);

    if (nextAssets.length < pickedAssets.length) {
      setError(`Only the first ${MAX_INTAKE_IMAGES} images are kept for a new product.`);
    }

    if (nextAssets.length === 0) {
      return;
    }

    const queueOffset = queueItems.length;

    setIsPreparingAssets(true);
    setResizeProgress({
      completed: 0,
      currentFileName: nextAssets[0]?.fileName ?? null,
      total: nextAssets.length,
    });
    setQueueItems((current) => [...current, ...nextAssets.map(createResizingQueueItem)]);

    try {
      for (const [index, asset] of nextAssets.entries()) {
        setResizeProgress({
          completed: index,
          currentFileName: asset.fileName ?? `Photo ${queueOffset + index + 1}`,
          total: nextAssets.length,
        });

        const optimizedAsset = await optimizeIntakeAsset(asset);

        setQueueItems((current) =>
          updateQueueItem(current, queueOffset + index, {
            asset: optimizedAsset,
            status: 'queued',
            error: null,
          }),
        );

        setResizeProgress({
          completed: index + 1,
          currentFileName: asset.fileName ?? `Photo ${queueOffset + index + 1}`,
          total: nextAssets.length,
        });
      }
    } catch (preparationError) {
      const message =
        preparationError instanceof Error && preparationError.message.trim().length > 0
          ? preparationError.message
          : 'Image preparation failed.';

      setError(message);
      setQueueItems((current) => current.filter((_item, itemIndex) => itemIndex < queueOffset));
    } finally {
      setIsPreparingAssets(false);
      setResizeProgress({
        completed: 0,
        currentFileName: null,
        total: 0,
      });
    }
  }

  async function pickImages() {
    if (remainingSlots === 0) {
      setError(`You can add up to ${MAX_INTAKE_IMAGES} images per product.`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Photo library permission is required to pick product images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: remainingSlots,
    });

    if (result.canceled) {
      return;
    }

    await appendAssets(result.assets);
  }

  async function captureImage() {
    if (remainingSlots === 0) {
      setError(`You can add up to ${MAX_INTAKE_IMAGES} images per product.`);
      return;
    }

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

    await appendAssets(result.assets);
  }

  function removeAsset(uri: string) {
    setQueueItems((current) => current.filter((item) => item.asset.uri !== uri));
  }

  function resetIntake() {
    setError(null);
    setQueueItems([]);
    setIsPreparingAssets(false);
    setResizeProgress({
      completed: 0,
      currentFileName: null,
      total: 0,
    });
  }

  async function submit() {
    if (isPreparingAssets) {
      setError('Wait for image optimization to finish before creating the product.');
      return null;
    }

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
    isPreparingAssets,
    resizeProgress,
    error,
    progress,
    hasFailedUploads,
    remainingSlots,
    pickImages,
    captureImage,
    removeAsset,
    resetIntake,
    submit,
  };
}

function createResizingQueueItem(asset: IntakeAsset): IntakeQueueItem {
  return {
    asset,
    status: 'resizing',
    error: null,
  };
}

function updateQueueItem(
  items: IntakeQueueItem[],
  index: number,
  patch: Partial<Pick<IntakeQueueItem, 'asset' | 'status' | 'error'>>,
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
