import type { Inquiry } from '@/src/features/inquiries/types';

export function inquiryDisplayName(inquiry: Inquiry) {
  return inquiry.full_name?.trim() || 'Unknown customer';
}

export function inquiryPrimaryText(inquiry: Inquiry) {
  return inquiry.message?.trim() || 'No message provided.';
}

export function inquirySecondaryText(inquiry: Inquiry) {
  return inquiry.contact?.trim() || inquiry.source_path?.trim() || 'No contact details';
}

export function formatInquiryTimestamp(value: string | null) {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
