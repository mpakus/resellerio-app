import { useEffect, useState } from 'react';

import { formatApiError } from '@/src/lib/api/client';
import {
  buildProductPublicationPayload,
  createProductPublicationDraft,
  productPublicationDraftEquals,
  type ProductPublicationDraft,
} from '@/src/features/products/publication-form';
import type { ProductDetail } from '@/src/features/products/types';

type UseProductPublicationFormArgs = {
  product: ProductDetail | null;
  onSave: (body: {
    product: Record<string, unknown>;
    marketplace_external_urls?: Record<string, string | null>;
  }) => Promise<ProductDetail>;
};

export function useProductPublicationForm({
  product,
  onSave,
}: UseProductPublicationFormArgs) {
  const [draft, setDraft] = useState<ProductPublicationDraft | null>(null);
  const [baseline, setBaseline] = useState<ProductPublicationDraft | null>(null);
  const [lastProductId, setLastProductId] = useState<number | null>(null);
  const [lastExternalKey, setLastExternalKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = Boolean(draft && baseline && !productPublicationDraftEquals(draft, baseline));

  useEffect(() => {
    if (!product) {
      setDraft(null);
      setBaseline(null);
      setLastProductId(null);
      setLastExternalKey(null);
      setError(null);
      return;
    }

    const nextDraft = createProductPublicationDraft(product);
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

  function updateStorefrontEnabled(value: boolean) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        storefrontEnabled: value,
      };
    });
  }

  function updateMarketplaceUrl(marketplace: string, value: string) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        marketplaceExternalUrls: {
          ...current.marketplaceExternalUrls,
          [marketplace]: value,
        },
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
      const updatedProduct = await onSave(buildProductPublicationPayload(draft));
      const nextBaseline = createProductPublicationDraft(updatedProduct);
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
    updateStorefrontEnabled,
    updateMarketplaceUrl,
    reset,
    save,
  };
}

function buildExternalProductKey(product: ProductDetail) {
  return `${product.id}:${product.updated_at ?? ''}:${product.storefront_enabled}:${product.storefront_published_at ?? ''}`;
}
