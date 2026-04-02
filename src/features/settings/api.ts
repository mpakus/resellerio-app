import { apiRequest } from '@/src/lib/api/client';
import type { MeResponse } from '@/src/lib/api/types';
import type {
  StorefrontPageResponse,
  StorefrontPagesResponse,
  StorefrontResponse,
} from '@/src/features/settings/types';

export function updateMarketplacePreferences(token: string, selectedMarketplaces: string[]) {
  return apiRequest<MeResponse>('/me', {
    method: 'PATCH',
    token,
    body: {
      user: {
        selected_marketplaces: selectedMarketplaces,
      },
    },
  });
}

export function getStorefront(token: string) {
  return apiRequest<StorefrontResponse>('/storefront', { token });
}

export function upsertStorefront(
  token: string,
  body: {
    storefront: {
      slug: string | null;
      title: string | null;
      tagline: string | null;
      description: string | null;
      theme_id: string | null;
      enabled: boolean;
    };
  },
) {
  return apiRequest<StorefrontResponse>('/storefront', {
    method: 'PUT',
    token,
    body,
  });
}

export function listStorefrontPages(token: string) {
  return apiRequest<StorefrontPagesResponse>('/storefront/pages', { token });
}

export function createStorefrontPage(
  token: string,
  body: {
    page: {
      title: string;
      slug: string;
      menu_label: string | null;
      body: string | null;
      published: boolean;
    };
  },
) {
  return apiRequest<StorefrontPageResponse>('/storefront/pages', {
    method: 'POST',
    token,
    body,
  });
}

export function updateStorefrontPage(
  token: string,
  pageId: number,
  body: {
    page: {
      title?: string;
      slug?: string;
      menu_label?: string | null;
      body?: string | null;
      published?: boolean;
    };
  },
) {
  return apiRequest<StorefrontPageResponse>(`/storefront/pages/${pageId}`, {
    method: 'PATCH',
    token,
    body,
  });
}

export function deleteStorefrontPage(token: string, pageId: number) {
  return apiRequest<{ data: { deleted: boolean } }>(`/storefront/pages/${pageId}`, {
    method: 'DELETE',
    token,
  });
}

export function reorderStorefrontPages(token: string, pageIds: number[]) {
  return apiRequest<StorefrontPagesResponse>('/storefront/pages/order', {
    method: 'PUT',
    token,
    body: {
      page_ids: pageIds,
    },
  });
}
