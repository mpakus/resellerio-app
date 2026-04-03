import type {
  MeResponse,
  SupportedMarketplace,
  UsageCounters,
  User,
} from '@/src/lib/api/types';

export type StorefrontAsset = {
  id: number | null;
  kind: string;
  storage_key: string | null;
  url?: string | null;
  content_type: string | null;
  original_filename: string | null;
  width: number | null;
  height: number | null;
  byte_size: number | null;
  inserted_at: string | null;
  updated_at: string | null;
};

export type StorefrontAssetKind = 'logo' | 'header';

export type StorefrontPage = {
  id: number;
  title: string;
  slug: string;
  menu_label: string | null;
  body: string | null;
  position: number;
  published: boolean;
  inserted_at: string | null;
  updated_at: string | null;
};

export type Storefront = {
  id: number | null;
  slug: string | null;
  title: string | null;
  tagline: string | null;
  description: string | null;
  theme_id: string | null;
  enabled: boolean;
  assets: StorefrontAsset[];
  pages: StorefrontPage[];
  inserted_at: string | null;
  updated_at: string | null;
};

export type StorefrontTheme = {
  id: string;
  label: string;
  colors: Record<string, string | null | undefined>;
};

export type StorefrontResponse = {
  data: {
    storefront: Storefront;
    themes: StorefrontTheme[];
  };
};

export type StorefrontPagesResponse = {
  data: {
    pages: StorefrontPage[];
  };
};

export type StorefrontPageResponse = {
  data: {
    page: StorefrontPage;
  };
};

export type StorefrontAssetUploadInstruction = {
  method: 'PUT';
  upload_url: string;
  headers: Record<string, string>;
  expires_at: string;
};

export type StorefrontAssetUploadResponse = {
  data: {
    asset: StorefrontAsset;
    upload_instruction: StorefrontAssetUploadInstruction;
  };
};

export type SettingsOverview = {
  user: User;
  supportedMarketplaces: SupportedMarketplace[];
  usage: UsageCounters;
  limits: UsageCounters;
  storefront: Storefront;
  themes: StorefrontTheme[];
};

export type SettingsLoadResult = {
  me: MeResponse;
  usage: {
    data: {
      usage: UsageCounters;
      limits: UsageCounters;
      addon_credits: Record<string, number>;
    };
  };
  storefront: StorefrontResponse;
  pages: StorefrontPagesResponse;
};

export type StorefrontDraft = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  theme_id: string;
  enabled: boolean;
};

export type StorefrontPageDraft = {
  title: string;
  slug: string;
  menu_label: string;
  body: string;
  published: boolean;
};
