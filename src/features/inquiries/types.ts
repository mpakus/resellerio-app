import type { PublicId } from '@/src/lib/api/types';

export type Inquiry = {
  id: PublicId;
  full_name: string | null;
  contact: string | null;
  message: string | null;
  source_path: string | null;
  product_id: PublicId | null;
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
