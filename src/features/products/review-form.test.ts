import {
  buildProductUpdatePayload,
  createProductReviewDraft,
  productReviewDraftEquals,
} from '@/src/features/products/review-form';
import type { ProductDetail } from '@/src/features/products/types';

describe('product review form helpers', () => {
  const product = {
    id: 'prod-11',
    status: 'processing',
    source: 'manual',
    title: 'Nike Air Max 90',
    brand: 'Nike',
    category: 'Sneakers',
    condition: 'Good',
    color: 'White',
    size: '10',
    material: 'Leather',
    price: '84.00',
    cost: '30.00',
    product_tab_id: 'tab-7',
    product_tab: {
      id: 'tab-7',
      name: 'Shoes',
      position: 1,
    },
    storefront_enabled: false,
    storefront_published_at: null,
    sku: 'NK-90',
    tags: ['air-max', 'vintage'],
    notes: 'Minor wear on heel',
    ai_summary: null,
    ai_confidence: null,
    sold_at: null,
    archived_at: null,
    inserted_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    latest_processing_run: null,
    latest_lifestyle_generation_run: null,
    description_draft: null,
    price_research: null,
    marketplace_listings: [],
    images: [],
  } as ProductDetail;

  it('creates a mobile review draft from product detail data', () => {
    expect(createProductReviewDraft(product)).toEqual({
      title: 'Nike Air Max 90',
      brand: 'Nike',
      category: 'Sneakers',
      condition: 'Good',
      color: 'White',
      size: '10',
      material: 'Leather',
      price: '84.00',
      cost: '30.00',
      sku: 'NK-90',
      notes: 'Minor wear on heel',
      tagsText: 'air-max, vintage',
      status: 'review',
      productTabId: 'tab-7',
    });
  });

  it('builds the patch payload with trimmed values, nulls, and tags array', () => {
    expect(
      buildProductUpdatePayload({
        title: ' Updated title ',
        brand: '',
        category: ' Sneakers ',
        condition: '',
        color: ' White ',
        size: '10',
        material: '',
        price: ' 95.00 ',
        cost: '',
        sku: ' NK-90 ',
        notes: ' Cleaned and measured ',
        tagsText: 'outerwear, shell, , winter ',
        status: 'ready',
        productTabId: null,
      }),
    ).toEqual({
      product: {
        title: 'Updated title',
        brand: null,
        category: 'Sneakers',
        condition: null,
        color: 'White',
        size: '10',
        material: null,
        price: '95.00',
        cost: null,
        sku: 'NK-90',
        notes: 'Cleaned and measured',
        product_tab_id: null,
        status: 'ready',
        tags: ['outerwear', 'shell', 'winter'],
      },
    });
  });

  it('compares review drafts for dirty-state checks', () => {
    const draft = createProductReviewDraft(product);

    expect(productReviewDraftEquals(draft, draft)).toBe(true);
    expect(productReviewDraftEquals(draft, { ...draft, title: 'Changed' })).toBe(false);
  });
});
