import type { ManualProductStatus, ProductDetail } from '@/src/features/products/types';

export type ProductReviewDraft = {
  title: string;
  brand: string;
  category: string;
  condition: string;
  color: string;
  size: string;
  material: string;
  price: string;
  cost: string;
  sku: string;
  notes: string;
  tagsText: string;
  status: ManualProductStatus;
  productTabId: number | null;
};

export const manualProductStatusOptions: { label: string; value: ManualProductStatus }[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Review', value: 'review' },
  { label: 'Ready', value: 'ready' },
  { label: 'Sold', value: 'sold' },
  { label: 'Archived', value: 'archived' },
];

export function createProductReviewDraft(product: ProductDetail): ProductReviewDraft {
  return {
    title: product.title ?? '',
    brand: product.brand ?? '',
    category: product.category ?? '',
    condition: product.condition ?? '',
    color: product.color ?? '',
    size: product.size ?? '',
    material: product.material ?? '',
    price: product.price ?? '',
    cost: product.cost ?? '',
    sku: product.sku ?? '',
    notes: product.notes ?? '',
    tagsText: product.tags.join(', '),
    status: toManualStatus(product.status),
    productTabId: product.product_tab_id ?? null,
  };
}

export function buildProductUpdatePayload(draft: ProductReviewDraft) {
  return {
    product: {
      title: nullIfBlank(draft.title),
      brand: nullIfBlank(draft.brand),
      category: nullIfBlank(draft.category),
      condition: nullIfBlank(draft.condition),
      color: nullIfBlank(draft.color),
      size: nullIfBlank(draft.size),
      material: nullIfBlank(draft.material),
      price: nullIfBlank(draft.price),
      cost: nullIfBlank(draft.cost),
      sku: nullIfBlank(draft.sku),
      notes: nullIfBlank(draft.notes),
      product_tab_id: draft.productTabId,
      status: draft.status,
      tags: splitTags(draft.tagsText),
    },
  };
}

export function productReviewDraftEquals(left: ProductReviewDraft, right: ProductReviewDraft) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function splitTags(tagsText: string) {
  return tagsText
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function nullIfBlank(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toManualStatus(status: ProductDetail['status']): ManualProductStatus {
  if (status === 'uploading' || status === 'processing') {
    return 'review';
  }

  return status;
}
