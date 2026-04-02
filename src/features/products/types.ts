export type ProductStatus =
  | 'draft'
  | 'uploading'
  | 'processing'
  | 'review'
  | 'ready'
  | 'sold'
  | 'archived';

export type ProductStatusFilter = 'all' | ProductStatus;

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
