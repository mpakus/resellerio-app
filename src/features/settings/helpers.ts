import type {
  Storefront,
  StorefrontDraft,
  StorefrontPage,
  StorefrontPageDraft,
} from '@/src/features/settings/types';

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

export function addonCreditsSummary(addonCredits: Record<string, number>) {
  const entries = Object.entries(addonCredits).filter(([, value]) => value > 0);

  if (entries.length === 0) {
    return 'No add-on credits';
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join(' · ');
}

export function buildReorderedStorefrontPageIds(
  pageIds: number[],
  pageId: number,
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
