import { useEffect, useState } from 'react';

import { formatApiError } from '@/src/lib/api/client';
import {
  buildProductUpdatePayload,
  createProductReviewDraft,
  productReviewDraftEquals,
  type ProductReviewDraft,
} from '@/src/features/products/review-form';
import type { ProductDetail } from '@/src/features/products/types';

type UseProductReviewFormArgs = {
  product: ProductDetail | null;
  onSave: (body: { product: Record<string, unknown> }) => Promise<ProductDetail>;
};

export function useProductReviewForm({
  product,
  onSave,
}: UseProductReviewFormArgs) {
  const [draft, setDraft] = useState<ProductReviewDraft | null>(null);
  const [baseline, setBaseline] = useState<ProductReviewDraft | null>(null);
  const [lastProductId, setLastProductId] = useState<number | null>(null);
  const [lastExternalKey, setLastExternalKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = Boolean(draft && baseline && !productReviewDraftEquals(draft, baseline));

  useEffect(() => {
    if (!product) {
      setDraft(null);
      setBaseline(null);
      setLastProductId(null);
      setLastExternalKey(null);
      setError(null);
      return;
    }

    const nextDraft = createProductReviewDraft(product);
    const externalKey = buildExternalProductKey(product);
    const shouldHydrate =
      lastProductId !== product.id || (!isDirty && lastExternalKey !== externalKey);

    if (shouldHydrate) {
      setDraft(nextDraft);
      setBaseline(nextDraft);
      setLastProductId(product.id);
      setLastExternalKey(externalKey);
      setError(null);
    }
  }, [isDirty, lastExternalKey, lastProductId, product]);

  function updateField<Key extends keyof ProductReviewDraft>(key: Key, value: ProductReviewDraft[Key]) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [key]: value,
      };
    });
  }

  function reset() {
    if (!baseline) {
      return;
    }

    setDraft(baseline);
    setError(null);
  }

  async function save() {
    if (!draft) {
      return null;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedProduct = await onSave(buildProductUpdatePayload(draft));
      const nextBaseline = createProductReviewDraft(updatedProduct);
      setDraft(nextBaseline);
      setBaseline(nextBaseline);
      setLastProductId(updatedProduct.id);
      setLastExternalKey(buildExternalProductKey(updatedProduct));
      return updatedProduct;
    } catch (saveError) {
      setError(formatApiError(saveError));
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    draft,
    isDirty,
    isSaving,
    error,
    updateField,
    reset,
    save,
  };
}

function buildExternalProductKey(product: ProductDetail) {
  return `${product.id}:${product.updated_at ?? ''}:${product.status}`;
}
