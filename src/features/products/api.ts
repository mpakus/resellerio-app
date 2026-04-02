import { apiRequest } from '@/src/lib/api/client';
import { buildProductsQuery } from '@/src/features/products/helpers';
import type {
  FinalizeUploadsResponse,
  ProductDetailResponse,
  ProductCreateResponse,
  ProductTabResponse,
  ProductTabsResponse,
  ProductsFilters,
  ProductsResponse,
} from '@/src/features/products/types';

export function listProducts(token: string, filters: ProductsFilters) {
  return apiRequest<ProductsResponse>(`/products?${buildProductsQuery(filters)}`, {
    token,
  });
}

export function getProduct(token: string, productId: number) {
  return apiRequest<ProductDetailResponse>(`/products/${productId}`, { token });
}

export function updateProduct(
  token: string,
  productId: number,
  body: {
    product: Record<string, unknown>;
  },
) {
  return apiRequest<ProductDetailResponse>(`/products/${productId}`, {
    method: 'PATCH',
    token,
    body,
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
