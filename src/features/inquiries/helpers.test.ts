import {
  formatInquiryTimestamp,
  inquiryContactText,
  inquiryDisplayName,
  inquiryPrimaryText,
} from '@/src/features/inquiries/helpers';

describe('inquiry helpers', () => {
  it('returns seller-facing fallback values', () => {
    const inquiry = {
      id: 'inq-1',
      full_name: null,
      contact: null,
      message: null,
      source_path: null,
      product_id: null,
      inserted_at: null,
    };

    expect(inquiryDisplayName(inquiry)).toBe('Unknown customer');
    expect(inquiryContactText(inquiry)).toBe('No contact details');
    expect(inquiryPrimaryText(inquiry)).toBe('No message provided.');
  });

  it('formats timestamps for the inquiry list', () => {
    expect(formatInquiryTimestamp('2026-04-02T10:00:00Z')).toMatch(/Apr 2, 2026/);
  });
});
