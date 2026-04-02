import type {
  MarketplaceListing,
  ProductRun,
  ProductDetail,
  ProductImage,
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

export function sortStorefrontImages(images: ProductDetail['images']) {
  return [...images]
    .filter((image) => image.processing_status === 'ready' && image.storefront_visible)
    .sort((left, right) => {
      return (
        (left.storefront_position ?? 99_999) - (right.storefront_position ?? 99_999) ||
        (left.position ?? 99_999) - (right.position ?? 99_999) ||
        left.id - right.id
      );
    });
}

export function buildReorderedStorefrontImageIds(
  imageIds: number[],
  imageId: number,
  direction: 'earlier' | 'later',
) {
  const currentIndex = imageIds.indexOf(imageId);

  if (currentIndex === -1) {
    return imageIds;
  }

  const nextIndex = direction === 'earlier' ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= imageIds.length) {
    return imageIds;
  }

  const reordered = [...imageIds];
  const [movedImageId] = reordered.splice(currentIndex, 1);
  reordered.splice(nextIndex, 0, movedImageId);
  return reordered;
}

export function storefrontSelectionCount(images: Pick<ProductImage, 'storefront_visible'>[]) {
  return images.filter((image) => image.storefront_visible).length;
}

export function formatProductDetailTimestamp(value: string | null) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatConfidenceScore(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return 'Not available';
  }

  return `${Math.round(value * 100)}%`;
}

export function formatCurrencyAmount(value: string | null, currency: string | null = 'USD') {
  if (!value) {
    return 'Not available';
  }

  if (!currency || currency === 'USD') {
    return `$${value}`;
  }

  return `${currency} ${value}`;
}

export function storefrontPublicationSummary(product: Pick<ProductDetail, 'storefront_enabled' | 'storefront_published_at'>) {
  if (!product.storefront_enabled) {
    return 'Storefront publishing is currently disabled for this product.';
  }

  if (product.storefront_published_at) {
    return `Published on ${formatProductDetailTimestamp(product.storefront_published_at)}.`;
  }

  return 'Storefront publishing is enabled, but this product has not been published yet.';
}

export function formatMarketplaceName(value: string) {
  const knownLabels: Record<string, string> = {
    ebay: 'eBay',
    poshmark: 'Poshmark',
    mercari: 'Mercari',
    depop: 'Depop',
    facebook_marketplace: 'Facebook Marketplace',
  };

  if (knownLabels[value]) {
    return knownLabels[value];
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function marketplaceListingHeadline(listing: Pick<MarketplaceListing, 'marketplace' | 'status'>) {
  return `${formatMarketplaceName(listing.marketplace)} · ${listing.status}`;
}

export function shouldPollLifestyleGeneration(product: ProductDetail | null) {
  if (!product) {
    return false;
  }

  return isActiveAsyncRun(product.latest_lifestyle_generation_run);
}

export function shouldPollProductDetail(product: ProductDetail | null) {
  if (!product) {
    return false;
  }

  if (product.status === 'uploading' || product.status === 'processing') {
    return true;
  }

  return isActiveProcessingRun(product.latest_processing_run);
}

export function processingBannerDescription(product: ProductDetail) {
  const run = product.latest_processing_run;
  const stepLabel = run?.step ? `Current step: ${run.step}. ` : '';

  if (product.status === 'uploading') {
    return `${stepLabel}We will keep refreshing this product automatically while uploads are still being finalized.`;
  }

  if (product.status === 'processing') {
    return `${stepLabel}AI processing is still running, so this detail screen will refresh automatically until review data is ready.`;
  }

  if (isActiveProcessingRun(run)) {
    return `${stepLabel}The latest processing run is still active, and this screen will keep polling for updates.`;
  }

  return 'Processing is not currently active.';
}

function isActiveProcessingRun(run: ProductRun | null) {
  return isActiveAsyncRun(run);
}

function isActiveAsyncRun(run: ProductRun | null) {
  if (!run) {
    return false;
  }

  if (!run.finished_at && run.status !== 'completed' && run.status !== 'failed') {
    return true;
  }

  return ['queued', 'running', 'processing', 'started', 'pending'].includes(run.status);
}
