import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useProductReviewForm } from '@/src/features/products/use-product-review-form';
import type { ProductDetail } from '@/src/features/products/types';

describe('useProductReviewForm', () => {
  const product = {
    id: 11,
    status: 'review',
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
    product_tab_id: 7,
    product_tab: {
      id: 7,
      name: 'Shoes',
      position: 1,
    },
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

  it('hydrates draft state and saves through the provided callback', async () => {
    const onSave = jest.fn().mockResolvedValue({
      ...product,
      title: 'Updated title',
      tags: ['shell', 'winter'],
    });

    const { result } = renderHook(() =>
      useProductReviewForm({
        product,
        onSave,
      }),
    );

    expect(result.current.draft?.title).toBe('Nike Air Max 90');
    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.updateField('title', 'Updated title');
      result.current.updateField('tagsText', 'shell, winter');
      result.current.updateField('status', 'ready');
      result.current.updateField('productTabId', null);
    });

    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      await result.current.save();
    });

    expect(onSave).toHaveBeenCalledWith({
      product: {
        title: 'Updated title',
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
        product_tab_id: null,
        status: 'ready',
        tags: ['shell', 'winter'],
      },
    });
    await waitFor(() => {
      expect(result.current.isDirty).toBe(false);
      expect(result.current.draft?.title).toBe('Updated title');
      expect(result.current.draft?.tagsText).toBe('shell, winter');
    });
  });

  it('keeps unsaved edits when the backing product refreshes with the same id', () => {
    const onSave = jest.fn();

    const { result, rerender } = renderHook(
      (props: { nextProduct: ProductDetail }) =>
        useProductReviewForm({
          product: props.nextProduct,
          onSave,
        }),
      {
        initialProps: {
          nextProduct: product,
        },
      },
    );

    act(() => {
      result.current.updateField('title', 'Locally edited title');
    });

    rerender({
      nextProduct: {
        ...product,
        updated_at: '2026-04-01T00:05:00Z',
        ai_summary: 'Refreshed from polling.',
      },
    });

    expect(result.current.draft?.title).toBe('Locally edited title');
    expect(result.current.isDirty).toBe(true);
  });
});
