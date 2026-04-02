import { useEffect, useRef, useState } from 'react';

import { formatApiError } from '@/src/lib/api/client';
import {
  approveGeneratedImage,
  archiveProduct,
  deleteProduct,
  deleteGeneratedImage,
  generateLifestyleImages,
  getCurrentStorefront,
  getProduct,
  listLifestyleGenerationRuns,
  markProductSold,
  reprocessProduct,
  reorderStorefrontImages,
  unarchiveProduct,
  updateImageStorefront,
  updateProduct,
} from '@/src/features/products/api';
import {
  shouldPollLifestyleGeneration,
  shouldPollProductDetail,
} from '@/src/features/products/helpers';
import type { LifestyleGenerationRun, ProductDetail } from '@/src/features/products/types';

const PRODUCT_DETAIL_POLL_INTERVAL_MS = 5000;

export function useProductDetail(token: string, productId: number) {
  const refreshRequestedRef = useRef(false);
  const pollRequestedRef = useRef(false);
  const lifestyleRunsRefreshRequestedRef = useRef(false);
  const lifestyleRunsPollRequestedRef = useRef(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [storefrontSlug, setStorefrontSlug] = useState<string | null>(null);
  const [lifestyleRuns, setLifestyleRuns] = useState<LifestyleGenerationRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLifestyleRuns, setIsLoadingLifestyleRuns] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isUpdatingLifecycle, setIsUpdatingLifecycle] = useState(false);
  const [isGeneratingLifestyle, setIsGeneratingLifestyle] = useState(false);
  const [isUpdatingMedia, setIsUpdatingMedia] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [lifestyleRunsReloadKey, setLifestyleRunsReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lifestyleRunsError, setLifestyleRunsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const isManualRefresh = refreshRequestedRef.current;
      const isPollRefresh = pollRequestedRef.current;

      setError(null);

      if (!isManualRefresh && !isPollRefresh) {
        setIsLoading(true);
      }

      try {
        const [productResult, storefrontResult] = await Promise.allSettled([
          getProduct(token, productId),
          getCurrentStorefront(token),
        ]);

        if (productResult.status === 'rejected') {
          throw productResult.reason;
        }

        if (cancelled) {
          return;
        }

        setProduct(productResult.value.data.product);
        setStorefrontSlug(
          storefrontResult.status === 'fulfilled'
            ? storefrontResult.value.data.storefront.slug
            : null,
        );
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(formatApiError(loadError));
      } finally {
        if (cancelled) {
          return;
        }

        refreshRequestedRef.current = false;
        pollRequestedRef.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [productId, reloadKey, token]);

  useEffect(() => {
    let cancelled = false;

    async function loadLifestyleRuns() {
      const isManualRefresh = lifestyleRunsRefreshRequestedRef.current;
      const isPollRefresh = lifestyleRunsPollRequestedRef.current;

      setLifestyleRunsError(null);

      if (!isManualRefresh && !isPollRefresh) {
        setIsLoadingLifestyleRuns(true);
      }

      try {
        const response = await listLifestyleGenerationRuns(token, productId);

        if (cancelled) {
          return;
        }

        setLifestyleRuns(response.data.runs);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setLifestyleRunsError(formatApiError(loadError));
      } finally {
        if (cancelled) {
          return;
        }

        lifestyleRunsRefreshRequestedRef.current = false;
        lifestyleRunsPollRequestedRef.current = false;
        setIsLoadingLifestyleRuns(false);
      }
    }

    void loadLifestyleRuns();

    return () => {
      cancelled = true;
    };
  }, [lifestyleRunsReloadKey, productId, token]);

  useEffect(() => {
    if ((!shouldPollProductDetail(product) && !shouldPollLifestyleGeneration(product)) || error) {
      return;
    }

    const timeoutId = setTimeout(() => {
      pollRequestedRef.current = true;
      setReloadKey((current) => current + 1);
    }, PRODUCT_DETAIL_POLL_INTERVAL_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [error, product]);

  useEffect(() => {
    if (!shouldPollLifestyleGeneration(product) || lifestyleRunsError) {
      return;
    }

    const timeoutId = setTimeout(() => {
      lifestyleRunsPollRequestedRef.current = true;
      setLifestyleRunsReloadKey((current) => current + 1);
    }, PRODUCT_DETAIL_POLL_INTERVAL_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [lifestyleRunsError, product]);

  function refresh() {
    refreshRequestedRef.current = true;
    setIsRefreshing(true);
    setReloadKey((current) => current + 1);
  }

  function refreshLifestyleRuns() {
    lifestyleRunsRefreshRequestedRef.current = true;
    setLifestyleRunsReloadKey((current) => current + 1);
  }

  async function saveProduct(body: { product: Record<string, unknown> }) {
    setIsSaving(true);

    try {
      const response = await updateProduct(token, productId, body);
      setProduct(response.data.product);
      return response.data.product;
    } finally {
      setIsSaving(false);
    }
  }

  async function retryProcessing() {
    setIsReprocessing(true);
    setError(null);

    try {
      const response = await reprocessProduct(token, productId);
      setProduct(response.data.product);
      return response.data.product;
    } catch (mutationError) {
      setError(formatApiError(mutationError));
      return null;
    } finally {
      setIsReprocessing(false);
    }
  }

  async function markSold() {
    return mutateLifecycle(async () => {
      const response = await markProductSold(token, productId);
      return response.data.product;
    });
  }

  async function archive() {
    return mutateLifecycle(async () => {
      const response = await archiveProduct(token, productId);
      return response.data.product;
    });
  }

  async function unarchive() {
    return mutateLifecycle(async () => {
      const response = await unarchiveProduct(token, productId);
      return response.data.product;
    });
  }

  async function removeProduct() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await deleteProduct(token, productId);
      return response.data.deleted;
    } catch (mutationError) {
      setError(formatApiError(mutationError));
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  async function generateLifestyle() {
    setIsGeneratingLifestyle(true);
    setError(null);

    try {
      const response = await generateLifestyleImages(token, productId);
      setProduct(response.data.product);
      refreshLifestyleRuns();
      return response.data.product;
    } catch (mutationError) {
      setError(formatApiError(mutationError));
      return null;
    } finally {
      setIsGeneratingLifestyle(false);
    }
  }

  async function approveLifestyleImage(imageId: number) {
    return mutateMedia(async () => {
      const response = await approveGeneratedImage(token, productId, imageId);
      return response.data.product;
    });
  }

  async function deleteLifestyleImage(imageId: number) {
    return mutateMedia(async () => {
      const response = await deleteGeneratedImage(token, productId, imageId);
      return response.data.product;
    });
  }

  async function setImageStorefrontVisibility(
    imageId: number,
    storefrontVisible: boolean,
    storefrontPosition?: number | null,
  ) {
    return mutateMedia(async () => {
      const response = await updateImageStorefront(token, productId, imageId, {
        storefront_visible: storefrontVisible,
        storefront_position: storefrontPosition,
      });
      return response.data.product;
    });
  }

  async function saveStorefrontImageOrder(imageIds: number[]) {
    return mutateMedia(async () => {
      const response = await reorderStorefrontImages(token, productId, imageIds);
      return response.data.product;
    });
  }

  async function mutateLifecycle(runMutation: () => Promise<ProductDetail>) {
    setIsUpdatingLifecycle(true);
    setError(null);

    try {
      const nextProduct = await runMutation();
      setProduct(nextProduct);
      return nextProduct;
    } catch (mutationError) {
      setError(formatApiError(mutationError));
      return null;
    } finally {
      setIsUpdatingLifecycle(false);
    }
  }

  async function mutateMedia(runMutation: () => Promise<ProductDetail>) {
    setIsUpdatingMedia(true);
    setError(null);

    try {
      const nextProduct = await runMutation();
      setProduct(nextProduct);
      refreshLifestyleRuns();
      return nextProduct;
    } catch (mutationError) {
      setError(formatApiError(mutationError));
      return null;
    } finally {
      setIsUpdatingMedia(false);
    }
  }

  return {
    product,
    storefrontSlug,
    lifestyleRuns,
    isLoading,
    isLoadingLifestyleRuns,
    isRefreshing,
    isSaving,
    isReprocessing,
    isUpdatingLifecycle,
    isGeneratingLifestyle,
    isUpdatingMedia,
    isDeleting,
    isPolling: shouldPollProductDetail(product),
    error,
    lifestyleRunsError,
    refresh,
    refreshLifestyleRuns,
    saveProduct,
    retryProcessing,
    markSold,
    archive,
    unarchive,
    removeProduct,
    generateLifestyle,
    approveLifestyleImage,
    deleteLifestyleImage,
    setImageStorefrontVisibility,
    saveStorefrontImageOrder,
  };
}
