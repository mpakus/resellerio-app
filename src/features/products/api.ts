import { apiRequest } from '@/src/lib/api/client';
import { buildProductsQuery } from '@/src/features/products/helpers';
import type {
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
