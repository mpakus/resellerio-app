import { apiRequest } from '@/src/lib/api/client';
import { buildProductsQuery } from '@/src/features/products/helpers';
import type { StorefrontResponse } from '@/src/features/settings/types';
import type {
  FinalizeUploadsResponse,
  ProductDetailResponse,
  ProductCreateResponse,
  ProductMutationResponse,
  ProductReprocessResponse,
  ProductTabResponse,
  ProductTabsResponse,
  ProductsFilters,
  ProductsResponse,
  LifestyleGenerationResponse,
  LifestyleGenerationRunsResponse,
} from '@/src/features/products/types';

export function listProducts(token: string, filters: ProductsFilters) {
  return apiRequest<ProductsResponse>(`/products?${buildProductsQuery(filters)}`, {
    token,
  });
}

export function getProduct(token: string, productId: number) {
  return apiRequest<ProductDetailResponse>(`/products/${productId}`, { token });
}

export function getCurrentStorefront(token: string) {
  return apiRequest<StorefrontResponse>('/storefront', { token });
}

export function updateProduct(
  token: string,
  productId: number,
  body: {
    product: Record<string, unknown>;
    marketplace_external_urls?: Record<string, string | null>;
  },
) {
  return apiRequest<ProductDetailResponse>(`/products/${productId}`, {
    method: 'PATCH',
    token,
    body,
  });
}

export function reprocessProduct(token: string, productId: number) {
  return apiRequest<ProductReprocessResponse>(`/products/${productId}/reprocess`, {
    method: 'POST',
    token,
    body: {},
  });
}

export function markProductSold(token: string, productId: number) {
  return apiRequest<ProductDetailResponse>(`/products/${productId}/mark_sold`, {
    method: 'POST',
    token,
    body: {},
  });
}

export function archiveProduct(token: string, productId: number) {
  return apiRequest<ProductDetailResponse>(`/products/${productId}/archive`, {
    method: 'POST',
    token,
    body: {},
  });
}

export function unarchiveProduct(token: string, productId: number) {
  return apiRequest<ProductDetailResponse>(`/products/${productId}/unarchive`, {
    method: 'POST',
    token,
    body: {},
  });
}

export function deleteProduct(token: string, productId: number) {
  return apiRequest<{ data: { deleted: boolean } }>(`/products/${productId}`, {
    method: 'DELETE',
    token,
  });
}

export function generateLifestyleImages(token: string, productId: number, sceneKey?: string) {
  return apiRequest<LifestyleGenerationResponse>(`/products/${productId}/generate_lifestyle_images`, {
    method: 'POST',
    token,
    body: sceneKey ? { scene_key: sceneKey } : {},
  });
}

export function listLifestyleGenerationRuns(token: string, productId: number) {
  return apiRequest<LifestyleGenerationRunsResponse>(`/products/${productId}/lifestyle_generation_runs`, {
    token,
  });
}

export function approveGeneratedImage(token: string, productId: number, imageId: number) {
  return apiRequest<ProductMutationResponse>(`/products/${productId}/generated_images/${imageId}/approve`, {
    method: 'POST',
    token,
    body: {},
  });
}

export function deleteGeneratedImage(token: string, productId: number, imageId: number) {
  return apiRequest<ProductMutationResponse>(`/products/${productId}/generated_images/${imageId}`, {
    method: 'DELETE',
    token,
  });
}

export function updateImageStorefront(
  token: string,
  productId: number,
  imageId: number,
  body: {
    storefront_visible?: boolean;
    storefront_position?: number | null;
  },
) {
  return apiRequest<ProductMutationResponse>(`/products/${productId}/images/${imageId}/storefront`, {
    method: 'PATCH',
    token,
    body,
  });
}

export function reorderStorefrontImages(token: string, productId: number, imageIds: number[]) {
  return apiRequest<ProductMutationResponse>(`/products/${productId}/images/storefront_order`, {
    method: 'PUT',
    token,
    body: {
      image_ids: imageIds,
    },
  });
}

export function createProduct(
  token: string,
  body: {
    product?: Record<string, unknown>;
    uploads: Record<string, unknown>[];
  },
) {
  return apiRequest<ProductCreateResponse>('/products', {
    method: 'POST',
    token,
    body,
  });
}

export function finalizeProductUploads(
  token: string,
  productId: number,
  uploads: Record<string, unknown>[],
) {
  return apiRequest<FinalizeUploadsResponse>(`/products/${productId}/finalize_uploads`, {
    method: 'POST',
    token,
    body: { uploads },
  });
}

export function listProductTabs(token: string) {
  return apiRequest<ProductTabsResponse>('/product_tabs', { token });
}

export function createProductTab(token: string, name: string) {
  return apiRequest<ProductTabResponse>('/product_tabs', {
    method: 'POST',
    token,
    body: {
      product_tab: {
        name: name.trim(),
      },
    },
  });
}

export function updateProductTab(token: string, tabId: number, name: string) {
  return apiRequest<ProductTabResponse>(`/product_tabs/${tabId}`, {
    method: 'PATCH',
    token,
    body: {
      product_tab: {
        name: name.trim(),
      },
    },
  });
}

export function deleteProductTab(token: string, tabId: number) {
  return apiRequest<{ data: { deleted: boolean } }>(`/product_tabs/${tabId}`, {
    method: 'DELETE',
    token,
  });
}
