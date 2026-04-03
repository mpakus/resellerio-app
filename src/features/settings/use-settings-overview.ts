import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';

import { getCurrentUsage, getCurrentUser } from '@/src/lib/api/auth';
import { formatApiError } from '@/src/lib/api/client';
import { emptySession } from '@/src/lib/auth/session';
import {
  buildStorefrontAssetPayload,
  uploadStorefrontAssetWithInstruction,
} from '@/src/features/settings/assets';
import {
  createStorefrontPage,
  deleteStorefrontAsset,
  deleteStorefrontPage,
  getStorefront,
  listStorefrontPages,
  prepareStorefrontAssetUpload,
  reorderStorefrontPages,
  updateMarketplacePreferences,
  updateStorefrontPage,
  upsertStorefront,
} from '@/src/features/settings/api';
import {
  buildStorefrontPagePayload,
  buildStorefrontPayload,
  createStorefrontDraft,
  getStorefrontAsset,
  removeStorefrontAssetByKind,
  replaceStorefrontAsset,
  storefrontDraftEquals,
} from '@/src/features/settings/helpers';
import type {
  SettingsOverview,
  Storefront,
  StorefrontDraft,
  StorefrontAssetKind,
  StorefrontPage,
  StorefrontPageDraft,
  StorefrontTheme,
} from '@/src/features/settings/types';

const emptyStorefront: Storefront = {
  id: null,
  slug: null,
  title: null,
  tagline: null,
  description: null,
  theme_id: null,
  enabled: false,
  assets: [],
  pages: [],
  inserted_at: null,
  updated_at: null,
};

const emptyThemes: StorefrontTheme[] = [];

export function useSettingsOverview(token: string) {
  const refreshRequestedRef = useRef(false);
  const [overview, setOverview] = useState<SettingsOverview>({
    user: emptySession.user,
    supportedMarketplaces: [],
    usage: emptySession.usage,
    limits: emptySession.limits,
    storefront: emptyStorefront,
    themes: emptyThemes,
  });
  const [storefrontPages, setStorefrontPages] = useState<StorefrontPage[]>([]);
  const [selectedMarketplacesDraft, setSelectedMarketplacesDraft] = useState<string[]>([]);
  const [storefrontDraft, setStorefrontDraft] = useState<StorefrontDraft>(
    createStorefrontDraft(emptyStorefront),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingMarketplaces, setIsSavingMarketplaces] = useState(false);
  const [isSavingStorefront, setIsSavingStorefront] = useState(false);
  const [isSavingPage, setIsSavingPage] = useState(false);
  const [uploadingAssetKind, setUploadingAssetKind] = useState<StorefrontAssetKind | null>(null);
  const [deletingAssetKind, setDeletingAssetKind] = useState<StorefrontAssetKind | null>(null);
  const [deletingPageId, setDeletingPageId] = useState<number | null>(null);
  const [reorderingPageId, setReorderingPageId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [marketplaceError, setMarketplaceError] = useState<string | null>(null);
  const [storefrontError, setStorefrontError] = useState<string | null>(null);
  const [brandingError, setBrandingError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const isManualRefresh = refreshRequestedRef.current;
      setError(null);

      if (!isManualRefresh) {
        setIsLoading(true);
      }

      try {
        const [meResponse, usageResponse, storefrontResponse, pagesResponse] = await Promise.all([
          getCurrentUser(token),
          getCurrentUsage(token),
          getStorefront(token),
          listStorefrontPages(token),
        ]);

        if (cancelled) {
          return;
        }

        const storefront = {
          ...storefrontResponse.data.storefront,
          pages: pagesResponse.data.pages,
        };

        setOverview({
          user: meResponse.data.user,
          supportedMarketplaces: meResponse.data.supported_marketplaces,
          usage: usageResponse.data.usage,
          limits: usageResponse.data.limits,
          storefront,
          themes: storefrontResponse.data.themes,
        });
        setSelectedMarketplacesDraft(meResponse.data.user.selected_marketplaces);
        setStorefrontDraft(createStorefrontDraft(storefront));
        setStorefrontPages(pagesResponse.data.pages);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(formatApiError(loadError));
      } finally {
        if (cancelled) {
          return;
        }

        refreshRequestedRef.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, token]);

  function refresh() {
    refreshRequestedRef.current = true;
    setIsRefreshing(true);
    setReloadKey((current) => current + 1);
  }

  function toggleMarketplace(marketplaceId: string) {
    setSelectedMarketplacesDraft((current) => {
      if (current.includes(marketplaceId)) {
        return current.filter((id) => id !== marketplaceId);
      }

      return [...current, marketplaceId];
    });
  }

  function resetMarketplaceDraft() {
    setSelectedMarketplacesDraft(overview.user.selected_marketplaces);
    setMarketplaceError(null);
  }

  async function saveMarketplaceDraft() {
    setIsSavingMarketplaces(true);
    setMarketplaceError(null);

    try {
      const response = await updateMarketplacePreferences(token, selectedMarketplacesDraft);

      setOverview((current) => ({
        ...current,
        user: response.data.user,
        supportedMarketplaces: response.data.supported_marketplaces,
      }));
      setSelectedMarketplacesDraft(response.data.user.selected_marketplaces);
      return true;
    } catch (saveError) {
      setMarketplaceError(formatApiError(saveError));
      return false;
    } finally {
      setIsSavingMarketplaces(false);
    }
  }

  function updateStorefrontField<Key extends keyof StorefrontDraft>(key: Key, value: StorefrontDraft[Key]) {
    setStorefrontDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetStorefrontDraft() {
    setStorefrontDraft(createStorefrontDraft(overview.storefront));
    setStorefrontError(null);
  }

  async function saveStorefrontDraft() {
    setIsSavingStorefront(true);
    setStorefrontError(null);

    try {
      const response = await upsertStorefront(token, buildStorefrontPayload(storefrontDraft));
      const storefront = {
        ...response.data.storefront,
        pages: storefrontPages,
      };

      setOverview((current) => ({
        ...current,
        storefront,
        themes: response.data.themes,
      }));
      setStorefrontDraft(createStorefrontDraft(storefront));
      return true;
    } catch (saveError) {
      setStorefrontError(formatApiError(saveError));
      return false;
    } finally {
      setIsSavingStorefront(false);
    }
  }

  async function uploadStorefrontAsset(kind: StorefrontAssetKind) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setBrandingError('Photo library permission is required to upload storefront branding.');
      return false;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled || result.assets.length === 0) {
      return false;
    }

    setUploadingAssetKind(kind);
    setBrandingError(null);

    try {
      const selectedAsset = result.assets[0];
      const response = await prepareStorefrontAssetUpload(
        token,
        kind,
        buildStorefrontAssetPayload(selectedAsset),
      );

      await uploadStorefrontAssetWithInstruction(
        response.data.upload_instruction,
        selectedAsset,
      );

      setOverview((current) => ({
        ...current,
        storefront: {
          ...current.storefront,
          assets: replaceStorefrontAsset(current.storefront.assets, response.data.asset),
        },
      }));
      return true;
    } catch (uploadError) {
      setBrandingError(formatApiError(uploadError));
      return false;
    } finally {
      setUploadingAssetKind(null);
    }
  }

  async function removeAsset(kind: StorefrontAssetKind) {
    setDeletingAssetKind(kind);
    setBrandingError(null);

    try {
      await deleteStorefrontAsset(token, kind);
      setOverview((current) => ({
        ...current,
        storefront: {
          ...current.storefront,
          assets: removeStorefrontAssetByKind(current.storefront.assets, kind),
        },
      }));
      return true;
    } catch (deleteError) {
      setBrandingError(formatApiError(deleteError));
      return false;
    } finally {
      setDeletingAssetKind(null);
    }
  }

  async function createPage(draft: StorefrontPageDraft) {
    setIsSavingPage(true);
    setPageError(null);

    try {
      const response = await createStorefrontPage(token, buildStorefrontPagePayload(draft));
      const nextPages = [...storefrontPages, response.data.page].sort(
        (left, right) => left.position - right.position,
      );

      setStorefrontPages(nextPages);
      setOverview((current) => ({
        ...current,
        storefront: {
          ...current.storefront,
          pages: nextPages,
        },
      }));
      return true;
    } catch (saveError) {
      setPageError(formatApiError(saveError));
      return false;
    } finally {
      setIsSavingPage(false);
    }
  }

  async function savePage(pageId: number, draft: StorefrontPageDraft) {
    setIsSavingPage(true);
    setPageError(null);

    try {
      const response = await updateStorefrontPage(token, pageId, buildStorefrontPagePayload(draft));
      const nextPages = storefrontPages
        .map((page) => (page.id === pageId ? response.data.page : page))
        .sort((left, right) => left.position - right.position);

      setStorefrontPages(nextPages);
      setOverview((current) => ({
        ...current,
        storefront: {
          ...current.storefront,
          pages: nextPages,
        },
      }));
      return true;
    } catch (saveError) {
      setPageError(formatApiError(saveError));
      return false;
    } finally {
      setIsSavingPage(false);
    }
  }

  async function removePage(pageId: number) {
    setDeletingPageId(pageId);
    setPageError(null);

    try {
      await deleteStorefrontPage(token, pageId);
      const nextPages = storefrontPages.filter((page) => page.id !== pageId);

      setStorefrontPages(nextPages);
      setOverview((current) => ({
        ...current,
        storefront: {
          ...current.storefront,
          pages: nextPages,
        },
      }));
      return true;
    } catch (deleteError) {
      setPageError(formatApiError(deleteError));
      return false;
    } finally {
      setDeletingPageId(null);
    }
  }

  async function savePageOrder(pageIds: number[], activePageId: number) {
    setReorderingPageId(activePageId);
    setPageError(null);

    try {
      const response = await reorderStorefrontPages(token, pageIds);
      setStorefrontPages(response.data.pages);
      setOverview((current) => ({
        ...current,
        storefront: {
          ...current.storefront,
          pages: response.data.pages,
        },
      }));
      return true;
    } catch (saveError) {
      setPageError(formatApiError(saveError));
      return false;
    } finally {
      setReorderingPageId(null);
    }
  }

  return {
    user: overview.user,
    supportedMarketplaces: overview.supportedMarketplaces,
    usage: overview.usage,
    limits: overview.limits,
    storefront: overview.storefront,
    themes: overview.themes,
    storefrontPages,
    selectedMarketplacesDraft,
    storefrontDraft,
    isLoading,
    isRefreshing,
    isSavingMarketplaces,
    isSavingStorefront,
    isSavingPage,
    uploadingAssetKind,
    deletingAssetKind,
    deletingPageId,
    reorderingPageId,
    error,
    marketplaceError,
    storefrontError,
    brandingError,
    pageError,
    logoAsset: getStorefrontAsset(overview.storefront, 'logo'),
    headerAsset: getStorefrontAsset(overview.storefront, 'header'),
    isMarketplacesDirty:
      selectedMarketplacesDraft.join('|') !== overview.user.selected_marketplaces.join('|'),
    isStorefrontDirty: !storefrontDraftEquals(
      storefrontDraft,
      createStorefrontDraft(overview.storefront),
    ),
    refresh,
    toggleMarketplace,
    resetMarketplaceDraft,
    saveMarketplaceDraft,
    updateStorefrontField,
    resetStorefrontDraft,
    saveStorefrontDraft,
    uploadStorefrontAsset,
    removeAsset,
    createPage,
    savePage,
    removePage,
    savePageOrder,
  };
}
