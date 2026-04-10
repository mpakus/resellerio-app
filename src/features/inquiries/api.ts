import { apiRequest } from '@/src/lib/api/client';
import type { PublicId } from '@/src/lib/api/types';
import type { InquiriesFilters, InquiriesResponse } from '@/src/features/inquiries/types';

export function buildInquiriesQuery(filters: InquiriesFilters) {
  const params = new URLSearchParams();

  params.set('page', String(filters.page));

  const trimmedQuery = filters.query.trim();

  if (trimmedQuery) {
    params.set('q', trimmedQuery);
  }

  return params.toString();
}

export function listInquiries(token: string, filters: InquiriesFilters) {
  return apiRequest<InquiriesResponse>(`/inquiries?${buildInquiriesQuery(filters)}`, {
    token,
  });
}

export function deleteInquiry(token: string, inquiryId: PublicId) {
  return apiRequest<{ data: { deleted: boolean } }>(`/inquiries/${inquiryId}`, {
    method: 'DELETE',
    token,
  });
}
