import type {
  ProductDetail,
  ProductStatus,
  ProductStatusFilter,
  ProductsFilters,
} from '@/src/features/products/types';

export const productStatusOptions: { label: string; value: ProductStatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Uploading', value: 'uploading' },
  { label: 'Processing', value: 'processing' },
  { label: 'Review', value: 'review' },
  { label: 'Ready', value: 'ready' },
  { label: 'Sold', value: 'sold' },
  { label: 'Archived', value: 'archived' },
];

export function buildProductsQuery(filters: ProductsFilters) {
  const params = new URLSearchParams();

  params.set('status', filters.status);
  params.set('page', String(filters.page));

  const trimmedQuery = filters.query.trim();

  if (trimmedQuery) {
    params.set('query', trimmedQuery);
  }

  if (filters.productTabId !== null) {
    params.set('product_tab_id', String(filters.productTabId));
  }

  return params.toString();
}

export function productSubtitle(product: {
  brand: string | null;
  category: string | null;
  product_tab: { name: string } | null;
}) {
  return [product.brand, product.category, product.product_tab?.name].filter(Boolean).join(' · ');
}

export function productStatusLabel(status: ProductStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function productPriceLabel(price: string | null) {
  if (!price) {
    return 'No price';
  }

  return `$${price}`;
}

export function processingHeadline(product: ProductDetail) {
  const run = product.latest_processing_run;

  if (!run) {
    return 'No processing run yet';
  }

  const step = run.step ? ` · ${run.step}` : '';
  return `${productStatusLabel(product.status)}${step}`;
}

export function imageKindCounts(images: ProductDetail['images']) {
  return images.reduce<Record<string, number>>((accumulator, image) => {
    accumulator[image.kind] = (accumulator[image.kind] ?? 0) + 1;
    return accumulator;
  }, {});
}
