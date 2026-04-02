export type Inquiry = {
  id: number;
  full_name: string | null;
  contact: string | null;
  message: string | null;
  source_path: string | null;
  product_id: number | null;
  inserted_at: string | null;
};

export type InquiriesPagination = {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
};

export type InquiriesFilters = {
  query: string;
  page: number;
};

export type InquiriesResponse = {
  data: {
    inquiries: Inquiry[];
    pagination: InquiriesPagination;
  };
};
