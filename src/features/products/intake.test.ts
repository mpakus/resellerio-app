import {
  buildCreateProductPayload,
  buildFinalizePayload,
  createAndUploadProduct,
} from '@/src/features/products/intake';
import * as productApi from '@/src/features/products/api';

jest.mock('@/src/features/products/api');

const mockedCreateProduct = jest.mocked(productApi.createProduct);
const mockedFinalizeProductUploads = jest.mocked(productApi.finalizeProductUploads);

describe('product intake helpers', () => {
  const assets = [
    {
      assetId: '1',
      fileName: 'shoe-front.jpg',
      fileSize: 120000,
      height: 1600,
      mimeType: 'image/jpeg',
      type: 'image' as const,
      uri: 'file:///shoe-front.jpg',
      width: 1200,
    },
    {
      assetId: '2',
      fileName: 'shoe-side.jpg',
      fileSize: 90000,
      height: 1600,
      mimeType: 'image/jpeg',
      type: 'image' as const,
      uri: 'file:///shoe-side.jpg',
      width: 1200,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds the create payload with upload metadata and optional tab id', () => {
    expect(
      buildCreateProductPayload(assets, {
        id: 7,
        name: 'Shoes',
        position: 1,
        inserted_at: null,
        updated_at: null,
      }),
    ).toEqual({
      product: {
        product_tab_id: 7,
      },
      uploads: [
        {
          filename: 'shoe-front.jpg',
          content_type: 'image/jpeg',
          byte_size: 120000,
          position: 1,
          width: 1200,
          height: 1600,
        },
        {
          filename: 'shoe-side.jpg',
          content_type: 'image/jpeg',
          byte_size: 90000,
          position: 2,
          width: 1200,
          height: 1600,
        },
      ],
    });
  });

  it('builds finalize payload from selected assets and upload instructions', () => {
    expect(
      buildFinalizePayload(assets, [
        {
          image_id: 10,
          storage_key: 'users/1/products/1/originals/shoe-front.jpg',
          method: 'PUT',
          upload_url: 'https://example.com/1',
          headers: { 'content-type': 'image/jpeg' },
          expires_at: '2026-04-01T00:00:00Z',
        },
        {
          image_id: 11,
          storage_key: 'users/1/products/1/originals/shoe-side.jpg',
          method: 'PUT',
          upload_url: 'https://example.com/2',
          headers: { 'content-type': 'image/jpeg' },
          expires_at: '2026-04-01T00:00:00Z',
        },
      ]),
    ).toEqual([
      { id: 10, byte_size: 120000, width: 1200, height: 1600 },
      { id: 11, byte_size: 90000, width: 1200, height: 1600 },
    ]);
  });

  it('creates, uploads, and finalizes a product in order', async () => {
    mockedCreateProduct.mockResolvedValue({
      data: {
        product: { id: 33 } as never,
        upload_instructions: [
          {
            image_id: 10,
            storage_key: 'users/1/products/33/originals/a.jpg',
            method: 'PUT',
            upload_url: 'https://example.com/a',
            headers: { 'content-type': 'image/jpeg' },
            expires_at: '2026-04-01T00:00:00Z',
          },
          {
            image_id: 11,
            storage_key: 'users/1/products/33/originals/b.jpg',
            method: 'PUT',
            upload_url: 'https://example.com/b',
            headers: { 'content-type': 'image/jpeg' },
            expires_at: '2026-04-01T00:00:00Z',
          },
        ],
      },
    });

    mockedFinalizeProductUploads.mockResolvedValue({
      data: {
        product: { id: 33 } as never,
        finalized_images: [],
        processing_run: null,
      },
    });

    const uploadBinary = jest.fn().mockResolvedValue(undefined);

    const result = await createAndUploadProduct({
      token: 'token-123',
      assets,
      productTab: null,
      uploadBinary,
    });

    expect(mockedCreateProduct).toHaveBeenCalledWith('token-123', {
      product: {
        product_tab_id: null,
      },
      uploads: [
        {
          filename: 'shoe-front.jpg',
          content_type: 'image/jpeg',
          byte_size: 120000,
          position: 1,
          width: 1200,
          height: 1600,
        },
        {
          filename: 'shoe-side.jpg',
          content_type: 'image/jpeg',
          byte_size: 90000,
          position: 2,
          width: 1200,
          height: 1600,
        },
      ],
    });
    expect(uploadBinary).toHaveBeenCalledTimes(2);
    expect(mockedFinalizeProductUploads).toHaveBeenCalledWith('token-123', 33, [
      { id: 10, byte_size: 120000, width: 1200, height: 1600 },
      { id: 11, byte_size: 90000, width: 1200, height: 1600 },
    ]);
    expect(result.finalizeResponse.data.product.id).toBe(33);
  });
});
