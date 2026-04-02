import type { ProductDetail } from '@/src/features/products/types';

export type ProductPublicationDraft = {
  storefrontEnabled: boolean;
  marketplaceExternalUrls: Record<string, string>;
};

export function createProductPublicationDraft(product: ProductDetail): ProductPublicationDraft {
  return {
    storefrontEnabled: product.storefront_enabled,
    marketplaceExternalUrls: product.marketplace_listings.reduce<Record<string, string>>(
      (accumulator, listing) => {
        accumulator[listing.marketplace] = listing.external_url ?? '';
        return accumulator;
      },
      {},
    ),
  };
}

export function buildProductPublicationPayload(draft: ProductPublicationDraft) {
  return {
    product: {
      storefront_enabled: draft.storefrontEnabled,
    },
    marketplace_external_urls: Object.fromEntries(
      Object.entries(draft.marketplaceExternalUrls).map(([marketplace, value]) => [
        marketplace,
        nullIfBlank(value),
      ]),
    ),
  };
}

export function productPublicationDraftEquals(
  left: ProductPublicationDraft,
  right: ProductPublicationDraft,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function nullIfBlank(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
