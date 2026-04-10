import type { PublicId } from '@/src/lib/api/types';
import type {
  Storefront,
  StorefrontDraft,
  StorefrontAsset,
  StorefrontAssetKind,
  StorefrontPage,
  StorefrontPageDraft,
  StorefrontTheme,
} from '@/src/features/settings/types';
import { appBaseUrl } from '@/src/lib/config/env';

export function createStorefrontDraft(storefront: Storefront): StorefrontDraft {
  return {
    slug: storefront.slug ?? '',
    title: storefront.title ?? '',
    tagline: storefront.tagline ?? '',
    description: storefront.description ?? '',
    theme_id: storefront.theme_id ?? '',
    enabled: storefront.enabled,
  };
}

export function storefrontDraftEquals(left: StorefrontDraft, right: StorefrontDraft) {
  return (
    left.slug === right.slug &&
    left.title === right.title &&
    left.tagline === right.tagline &&
    left.description === right.description &&
    left.theme_id === right.theme_id &&
    left.enabled === right.enabled
  );
}

export function buildStorefrontPayload(draft: StorefrontDraft) {
  const normalize = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  return {
    storefront: {
      slug: normalize(draft.slug),
      title: normalize(draft.title),
      tagline: normalize(draft.tagline),
      description: normalize(draft.description),
      theme_id: normalize(draft.theme_id),
      enabled: draft.enabled,
    },
  };
}

export function createStorefrontPageDraft(page?: StorefrontPage | null): StorefrontPageDraft {
  return {
    title: page?.title ?? '',
    slug: page?.slug ?? '',
    menu_label: page?.menu_label ?? '',
    body: page?.body ?? '',
    published: page?.published ?? true,
  };
}

export function buildStorefrontPagePayload(draft: StorefrontPageDraft) {
  const normalize = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  return {
    page: {
      title: draft.title.trim(),
      slug: draft.slug.trim(),
      menu_label: normalize(draft.menu_label),
      body: normalize(draft.body),
      published: draft.published,
    },
  };
}

export function storefrontAssetSummary(storefront: Storefront) {
  const logoCount = storefront.assets.filter((asset) => asset.kind === 'logo').length;
  const headerCount = storefront.assets.filter((asset) => asset.kind === 'header').length;
  return `Logo: ${logoCount} · Header: ${headerCount}`;
}

export function getStorefrontAsset(storefront: Storefront, kind: StorefrontAssetKind) {
  return storefront.assets.find((asset) => asset.kind === kind) ?? null;
}

export function replaceStorefrontAsset(assets: StorefrontAsset[], nextAsset: StorefrontAsset) {
  return [...assets.filter((asset) => asset.kind !== nextAsset.kind), nextAsset].sort((left, right) =>
    left.kind.localeCompare(right.kind),
  );
}

export function removeStorefrontAssetByKind(
  assets: StorefrontAsset[],
  kind: StorefrontAssetKind,
) {
  return assets.filter((asset) => asset.kind !== kind);
}

export function storefrontAssetDetails(asset: StorefrontAsset | null) {
  if (!asset) {
    return 'No image uploaded yet.';
  }

  return 'Preview ready';
}

export function visibleStorefrontThemes(
  themes: StorefrontTheme[],
  showAllThemes: boolean,
  currentThemeId: string,
) {
  if (showAllThemes || themes.length <= 2) {
    return themes;
  }

  const selectedTheme = themes.find((theme) => theme.id === currentThemeId);
  const defaults = themes.slice(0, 2);

  if (selectedTheme && !defaults.some((theme) => theme.id === selectedTheme.id)) {
    return [defaults[0], selectedTheme].filter(Boolean) as StorefrontTheme[];
  }

  return defaults;
}

export function selectedStorefrontTheme(
  themes: StorefrontTheme[],
  currentThemeId: string,
) {
  return themes.find((theme) => theme.id === currentThemeId) ?? themes[0] ?? null;
}

export function storefrontThemePreviewSwatches(theme: StorefrontTheme) {
  const colors = theme.colors;

  return [
    colors.primary_button,
    colors.secondary_accent,
    colors.page_background,
    colors.text,
  ].filter((value): value is string => Boolean(value));
}

export function buildStorefrontUrl(storefrontSlug: string | null, baseUrl: string = appBaseUrl) {
  const normalizedSlug = storefrontSlug?.trim();

  if (!normalizedSlug) {
    return null;
  }

  return `${baseUrl}/store/${normalizedSlug}`;
}

export function buildPublicAppUrl(pathOrUrl: string | null, baseUrl: string = appBaseUrl) {
  const normalizedValue = pathOrUrl?.trim();

  if (!normalizedValue) {
    return null;
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const normalizedPath = normalizedValue.startsWith('/') ? normalizedValue : `/${normalizedValue}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

export function addonCreditsSummary(addonCredits: Record<string, number>) {
  const entries = Object.entries(addonCredits).filter(([, value]) => value > 0);

  if (entries.length === 0) {
    return 'No add-on credits';
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join(' · ');
}

export function buildReorderedStorefrontPageIds(
  pageIds: PublicId[],
  pageId: PublicId,
  direction: 'earlier' | 'later',
) {
  const currentIndex = pageIds.indexOf(pageId);

  if (currentIndex === -1) {
    return pageIds;
  }

  const nextIndex = direction === 'earlier' ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= pageIds.length) {
    return pageIds;
  }

  const reordered = [...pageIds];
  const [movedPageId] = reordered.splice(currentIndex, 1);
  reordered.splice(nextIndex, 0, movedPageId);
  return reordered;
}

export function subscriptionDetailsSummary(user: {
  plan_status: string | null;
  plan_period: string | null;
  plan_expires_at: string | null;
  trial_ends_at: string | null;
}) {
  const detailParts = [user.plan_status ?? 'free'];

  if (user.plan_period) {
    detailParts.push(user.plan_period);
  }

  if (user.plan_expires_at) {
    detailParts.push(`renews ${user.plan_expires_at}`);
  } else if (user.trial_ends_at) {
    detailParts.push(`trial ends ${user.trial_ends_at}`);
  }

  return detailParts.join(' · ');
}
