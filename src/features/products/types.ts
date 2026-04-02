export type ProductStatus =
  | 'draft'
  | 'uploading'
  | 'processing'
  | 'review'
  | 'ready'
  | 'sold'
  | 'archived';

export type ProductStatusFilter = 'all' | ProductStatus;

export type ManualProductStatus = 'draft' | 'review' | 'ready' | 'sold' | 'archived';

export type ProductTab = {
  id: number;
  name: string;
  position: number;
  inserted_at: string | null;
  updated_at: string | null;
};

export type ProductSummary = {
  id: number;
  status: ProductStatus;
  title: string | null;
  brand: string | null;
  category: string | null;
  price: string | null;
  updated_at: string | null;
  product_tab: {
    id: number;
    name: string;
    position: number;
  } | null;
};

export type ProductsPagination = {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
};

export type ProductsFilters = {
  status: ProductStatusFilter;
  query: string;
  productTabId: number | null;
  page: number;
};

export type ProductsResponse = {
  data: {
    products: ProductSummary[];
    pagination: ProductsPagination;
    filters: {
      status: ProductStatusFilter;
      query: string | null;
      product_tab_id: number | null;
      updated_from: string | null;
      updated_to: string | null;
      sort: string;
      dir: string;
    };
  };
};

export type ProductImage = {
  id: number;
  kind: string;
  position: number | null;
  storage_key: string;
  url?: string | null;
  content_type: string | null;
  width: number | null;
  height: number | null;
  byte_size: number | null;
  checksum: string | null;
  background_style: string | null;
  processing_status: string;
  original_filename: string | null;
  storefront_visible: boolean;
  storefront_position: number | null;
  lifestyle_generation_run_id: number | null;
  scene_key: string | null;
  variant_index: number | null;
  source_image_ids: number[];
  seller_approved: boolean;
  approved_at: string | null;
  inserted_at: string | null;
  updated_at: string | null;
};

export type ProductRun = {
  id: number;
  status: string;
  step: string | null;
  started_at: string | null;
  finished_at: string | null;
  error_code: string | null;
  error_message: string | null;
  inserted_at: string | null;
  updated_at: string | null;
  payload: unknown;
};

export type LifestyleGenerationRun = ProductRun & {
  scene_family: string | null;
  model: string | null;
  prompt_version: string | null;
  requested_count: number | null;
  completed_count: number | null;
};

export type DescriptionDraft = {
  id: number;
  status: string;
  provider: string | null;
  model: string | null;
  suggested_title: string | null;
  short_description: string | null;
  long_description: string | null;
  key_features: string[];
  seo_keywords: string[];
  missing_details_warning: string | null;
  inserted_at: string | null;
  updated_at: string | null;
};

export type PriceResearch = {
  id: number;
  status: string;
  provider: string | null;
  model: string | null;
  currency: string | null;
  suggested_min_price: string | null;
  suggested_target_price: string | null;
  suggested_max_price: string | null;
  suggested_median_price: string | null;
  pricing_confidence: number | null;
  rationale_summary: string | null;
  market_signals: string[];
  comparable_results: unknown[];
  inserted_at: string | null;
  updated_at: string | null;
};

export type MarketplaceListing = {
  id: number;
  marketplace: string;
  status: string;
  generated_title: string | null;
  generated_description: string | null;
  generated_tags: string[];
  generated_price_suggestion: string | null;
  generation_version: string | null;
  compliance_warnings: string[];
  external_url: string | null;
  external_url_added_at: string | null;
  last_generated_at: string | null;
  inserted_at: string | null;
  updated_at: string | null;
};

export type ProductDetail = ProductSummary & {
  source: string | null;
  condition: string | null;
  color: string | null;
  size: string | null;
  material: string | null;
  cost: string | null;
  product_tab_id: number | null;
  sku: string | null;
  tags: string[];
  notes: string | null;
  storefront_enabled: boolean;
  storefront_published_at: string | null;
  ai_summary: string | null;
  ai_confidence: number | null;
  sold_at: string | null;
  archived_at: string | null;
  inserted_at: string | null;
  latest_processing_run: ProductRun | null;
  latest_lifestyle_generation_run: LifestyleGenerationRun | null;
  description_draft: DescriptionDraft | null;
  price_research: PriceResearch | null;
  marketplace_listings: MarketplaceListing[];
  image_urls?: string[];
  images: ProductImage[];
};

export type ProductTabsResponse = {
  data: {
    product_tabs: ProductTab[];
  };
};

export type ProductTabResponse = {
  data: {
    product_tab: ProductTab;
  };
};

export type ProductDetailResponse = {
  data: {
    product: ProductDetail;
  };
};

export type ProductMutationResponse = {
  data: {
    product: ProductDetail;
    deleted?: boolean;
  };
};

export type ProductReprocessResponse = {
  data: {
    product: ProductDetail;
    processing_run: ProductRun | null;
  };
};

export type LifestyleGenerationResponse = {
  data: {
    product: ProductDetail;
    lifestyle_generation_run: LifestyleGenerationRun | null;
  };
};

export type LifestyleGenerationRunsResponse = {
  data: {
    runs: LifestyleGenerationRun[];
  };
};

export type UploadInstruction = {
  image_id: number;
  storage_key: string;
  method: 'PUT';
  upload_url: string;
  headers: Record<string, string>;
  expires_at: string;
};

export type ProductCreateResponse = {
  data: {
    product: ProductDetail;
    upload_instructions: UploadInstruction[];
  };
};

export type FinalizedUploadImage = {
  id: number;
  kind: string;
  processing_status: string;
};

export type FinalizeUploadsResponse = {
  data: {
    product: ProductDetail;
    finalized_images: FinalizedUploadImage[];
    processing_run: ProductRun | null;
  };
};
